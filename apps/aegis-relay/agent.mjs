import http from 'node:http'
import { WebSocket } from 'ws'
import { allowed, MAX_REQUEST, MAX_MESSAGE, MAX_BUFFERED, CHUNK } from './policy.mjs'
import { localLab } from './lab-store.mjs'

const bridgeURL = process.env.AEGIS_BRIDGE_URL
const token = process.env.AEGIS_BRIDGE_TOKEN
const local = process.env.AEGIS_LOCAL_ORIGIN || 'http://127.0.0.1:5174'
const target = new URL(local)
if (!bridgeURL?.startsWith('wss://') || !token || token.length < 32 || target.protocol !== 'http:' || !['127.0.0.1','localhost','::1','[::1]'].includes(target.hostname)) throw Error('Invalid local agent configuration')
const idValid = id => typeof id === 'string' && /^[a-f0-9-]{36}$/.test(id)
let active = null
function connect() {
  const ws = new WebSocket(bridgeURL,{headers:{authorization:`Bearer ${token}`},maxPayload:MAX_MESSAGE,perMessageDeflate:false,handshakeTimeout:10000})
  active=ws
  const requests=new Map(), sockets=new Map()
  const send = msg => {if(ws.readyState!==WebSocket.OPEN || ws.bufferedAmount>MAX_BUFFERED)return false;ws.send(JSON.stringify(msg));return true}
  async function sendChunk(id, data) {
    const deadline=Date.now()+10000
    while(ws.readyState===WebSocket.OPEN && ws.bufferedAmount>MAX_BUFFERED && Date.now()<deadline) await new Promise(r=>setTimeout(r,20))
    return send({type:'chunk',id,data:data.toString('base64')})
  }
  ws.on('message',raw=>{
    let m;try{m=JSON.parse(raw.toString())}catch{ws.close(1003);return}
    if(!idValid(m.id))return
    if(m.type==='cancel'){requests.get(m.id)?.destroy();requests.delete(m.id);return}
    if(m.type==='ws-open'){
      if(sockets.has(m.id))return
      const radar=new WebSocket(`ws://${target.host}/ws`,{maxPayload:65536,perMessageDeflate:false,handshakeTimeout:5000});sockets.set(m.id,radar)
      radar.on('open',()=>{if(!send({type:'ws-open',id:m.id}))radar.close()})
      radar.on('message',(data,binary)=>{if(binary || data.length>65536 || !send({type:'ws-data',id:m.id,data:data.toString()}))radar.close()})
      radar.on('close',()=>{sockets.delete(m.id);send({type:'ws-close',id:m.id})})
      radar.on('error',()=>radar.terminate());return
    }
    if(m.type==='ws-close'){sockets.get(m.id)?.close();sockets.delete(m.id);return}
    if(m.type==='ws-data'){const radar=sockets.get(m.id);if(typeof m.data!=='string'||Buffer.byteLength(m.data)>65536||radar?.readyState!==WebSocket.OPEN||radar.bufferedAmount>MAX_BUFFERED){radar?.close();return}radar.send(m.data);return}
    if(m.type!=='request'||!allowed(m.method,m.path)||requests.has(m.id))return
    const body=Buffer.from(typeof m.body==='string'?m.body:'','base64')
    if(body.length>MAX_REQUEST){send({type:'error',id:m.id});return}
    if (m.path === '/dashboard/aegis/api/lab') {
      void localLab(m.method,body).then(async result=>{
        if (!send({type:'headers',id:m.id,status:result.status,headers:{'content-type':'application/json; charset=utf-8'}})) return
        for(let at=0;at<result.body.length;at+=CHUNK)if(!await sendChunk(m.id,result.body.subarray(at,at+CHUNK)))return
        send({type:'end',id:m.id})
      }).catch(()=>send({type:'error',id:m.id}))
      return
    }
    const headers={};for(const k of ['content-type','authorization'])if(typeof m.headers?.[k]==='string'&&m.headers[k].length<4096&&m.headers[k])headers[k]=m.headers[k]
    const upstream=http.request({hostname:target.hostname,port:target.port||80,path:m.path,method:m.method,headers,timeout:120000},async response=>{
      const responseHeaders={};for(const k of ['content-type','content-length'])if(typeof response.headers[k]==='string')responseHeaders[k]=response.headers[k]
      if(!send({type:'headers',id:m.id,status:response.statusCode,headers:responseHeaders})){upstream.destroy();return}
      try { for await(const data of response){for(let at=0;at<data.length;at+=CHUNK)if(!await sendChunk(m.id,data.subarray(at,at+CHUNK)))throw Error('bridge backpressure')} send({type:'end',id:m.id}) } catch {send({type:'error',id:m.id})} finally {requests.delete(m.id)}
    })
    requests.set(m.id,upstream);upstream.on('timeout',()=>upstream.destroy());upstream.on('error',()=>{requests.delete(m.id);send({type:'error',id:m.id})});upstream.end(body)
  })
  ws.on('close',()=>{for(const r of requests.values())r.destroy();for(const s of sockets.values())s.terminate();requests.clear();sockets.clear();if(active===ws)setTimeout(connect,3000)})
  ws.on('error',()=>ws.terminate())
}
connect()
