import http from 'node:http'
import { timingSafeEqual, randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { resolve, extname, sep } from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'
import { allowed, MAX_REQUEST, MAX_MESSAGE, MAX_BUFFERED } from './policy.mjs'

const publicOrigin = process.env.PUBLIC_ORIGIN
const adminOrigin = process.env.ADMIN_INTERNAL_ORIGIN
const bridgeToken = process.env.BRIDGE_TOKEN
const root = resolve(process.env.SPECTRA_DIST || './dist')
if (!publicOrigin || !adminOrigin || !bridgeToken || bridgeToken.length < 32) throw new Error('Missing required gateway configuration')
const pending = new Map(), sockets = new Map(), upgrades = new Map()
let bridge = null, lastSeen = null
const wsServer = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE, perMessageDeflate: false })
const tokenEqual = value => { const a = Buffer.from(value || ''), b = Buffer.from(bridgeToken); return a.length === b.length && timingSafeEqual(a,b) }
const send = (socket, msg) => { if (!socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > MAX_BUFFERED) return false; socket.send(JSON.stringify(msg)); return true }
async function admin(req) {
  if (req.headers['sec-fetch-site'] === 'cross-site') return false
  try {
    const r = await fetch(`${adminOrigin}/dashboard/aegis/api/authorize`, { headers: { cookie: req.headers.cookie || '' }, redirect: 'manual', signal: AbortSignal.timeout(4000) })
    return r.status === 200
  } catch { return false }
}
function dropBridge() {
  bridge = null
  for (const { res, timer } of pending.values()) { clearTimeout(timer); if (!res.headersSent) res.writeHead(503); res.end() }
  pending.clear()
  for (const u of upgrades.values()) { clearTimeout(u.timer); u.socket.destroy() }
  upgrades.clear()
  for (const ws of sockets.values()) ws.close(1012, 'Puente desconectado')
  sockets.clear()
}
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.wasm':'application/wasm' }
const server = http.createServer(async (req,res) => {
  const u = new URL(req.url, publicOrigin), path = u.pathname
  if (path === '/healthz' && req.method === 'GET') { res.writeHead(200, {'cache-control':'no-store'}).end('ok'); return }
  if (!await admin(req)) { res.writeHead(401, {'Cache-Control':'no-store'}).end('No autorizado'); return }
  if (path === '/dashboard/aegis/bridge-status' && req.method === 'GET') { res.writeHead(200, {'content-type':'application/json','cache-control':'no-store'}).end(JSON.stringify({ bridge: !!bridge, lastSeen, hardware: 'desconocido' })); return }
  if (path.startsWith('/dashboard/aegis/spectra/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return }
    const relative = path.slice('/dashboard/aegis/spectra/'.length) || 'index.html'
    if (relative.includes('..') || relative.includes('\\') || /%/.test(relative)) { res.writeHead(400).end(); return }
    const file = resolve(root, relative)
    if (!file.startsWith(root+sep)) { res.writeHead(400).end(); return }
    try { const info = await stat(file); if (!info.isFile() || info.size > 50*1024*1024) throw Error(); res.writeHead(200, {'content-type':mime[extname(file)] || 'application/octet-stream','content-length':info.size,'cache-control':'private, no-store','x-content-type-options':'nosniff'}); if(req.method === 'HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res) } catch { res.writeHead(404).end() }
    return
  }
  if (!allowed(req.method, req.url)) { res.writeHead(404).end(); return }
  if (req.method !== 'GET' && req.headers.origin !== publicOrigin) { res.writeHead(403).end(); return }
  if (!bridge) { res.writeHead(503, {'cache-control':'no-store'}).end('Puente local desconectado'); return }
  let chunks=[], size=0
  try { for await (const chunk of req) { size+=chunk.length; if (size>MAX_REQUEST) {res.writeHead(413).end(); return} chunks.push(chunk) } } catch { return }
  const id=randomUUID()
  const timer=setTimeout(()=>{ if (pending.has(id)) { pending.delete(id); send(bridge,{type:'cancel',id}); if(!res.headersSent)res.writeHead(504); res.end() } },120000)
  pending.set(id,{res,timer})
  res.on('close',()=>{ if (pending.has(id)) { pending.delete(id);clearTimeout(timer);send(bridge,{type:'cancel',id}) } })
  if (!send(bridge,{type:'request',id,method:req.method,path:req.url,headers:{'content-type':req.headers['content-type'] || '',authorization:req.headers.authorization || ''},body:Buffer.concat(chunks).toString('base64')})) { clearTimeout(timer);pending.delete(id);res.writeHead(503).end() }
})
server.on('upgrade', async (req,socket,head) => {
  const path = new URL(req.url, publicOrigin).pathname
  if (path === '/aegis-bridge') {
    if (!tokenEqual((req.headers.authorization || '').replace(/^Bearer /,'')) || bridge) { socket.destroy(); return }
    wsServer.handleUpgrade(req,socket,head,ws=>{
      bridge=ws;lastSeen=new Date().toISOString(); ws.isAlive=true
      ws.on('pong',()=>{ws.isAlive=true;lastSeen=new Date().toISOString()})
      ws.on('message',raw=>{
        let m;try {m=JSON.parse(raw.toString())} catch {ws.close(1003);return}
        if (m.type === 'ws-open') {
          const u=upgrades.get(m.id); if(!u)return
          upgrades.delete(m.id);clearTimeout(u.timer)
          wsServer.handleUpgrade(u.req,u.socket,u.head,client=>{
            sockets.set(m.id,client)
            const authTimer=setInterval(async()=>{if(!await admin(u.req))client.close(1008,'Sesión vencida')},60000)
            const ttl=setTimeout(()=>client.close(1008,'Renueva la sesión'),600000)
            client.on('close',()=>{clearInterval(authTimer);clearTimeout(ttl)})
            client.on('message',(raw,binary)=>{if(binary || raw.length>65536 || !send(bridge,{type:'ws-data',id:m.id,data:raw.toString()}))client.close(1013)})
            client.on('close',()=>{sockets.delete(m.id);send(bridge,{type:'ws-close',id:m.id})})
            client.on('error',()=>client.terminate())
          });return
        }
        if (m.type === 'ws-data') { const client=sockets.get(m.id); if(client && client.readyState===WebSocket.OPEN && client.bufferedAmount<MAX_BUFFERED) client.send(m.data); else client?.close(1013); return }
        if (m.type === 'ws-close') {const u=upgrades.get(m.id);if(u){clearTimeout(u.timer);u.socket.destroy();upgrades.delete(m.id)} sockets.get(m.id)?.close(1012);sockets.delete(m.id);return}
        const p=pending.get(m.id);if(!p)return
        if (m.type === 'headers') {const h={'cache-control':'no-store','x-content-type-options':'nosniff'};for(const k of ['content-type','content-length'])if(typeof m.headers?.[k]==='string')h[k]=m.headers[k]; p.res.writeHead(Number.isInteger(m.status)&&m.status>=100&&m.status<=599?m.status:502,h)}
        if (m.type === 'chunk') { const b=Buffer.from(m.data || '', 'base64');if(b.length>64*1024){ws.close(1009);return} if(!p.res.write(b)){ws._socket.pause(); const resume=()=>ws._socket?.resume();p.res.once('drain',resume);p.res.once('close',resume);p.res.once('error',resume)} }
        if (m.type === 'end') {clearTimeout(p.timer);pending.delete(m.id);p.res.end()}
        if (m.type === 'error') {clearTimeout(p.timer);pending.delete(m.id);if(!p.res.headersSent)p.res.writeHead(502);p.res.end()}
      })
      ws.on('close',dropBridge);ws.on('error',()=>ws.terminate())
    });return
  }
  if (path !== '/ws' || req.headers.origin !== publicOrigin || !await admin(req) || !bridge) {socket.destroy();return}
  const id=randomUUID()
  const timer=setTimeout(()=>{upgrades.delete(id);socket.destroy();send(bridge,{type:'ws-close',id})},5000)
  upgrades.set(id,{req,socket,head,timer})
  socket.on('close',()=>{const u=upgrades.get(id);if(u){clearTimeout(u.timer);upgrades.delete(id);send(bridge,{type:'ws-close',id})}})
  if(!send(bridge,{type:'ws-open',id})){clearTimeout(timer);upgrades.delete(id);socket.destroy()}

})
setInterval(()=>{if(!bridge)return;if(!bridge.isAlive){bridge.terminate();return}bridge.isAlive=false;bridge.ping()},15000).unref()
server.listen(Number(process.env.PORT || 8080),'::')
