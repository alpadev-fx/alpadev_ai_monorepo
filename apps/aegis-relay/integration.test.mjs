import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import net from 'node:net'
import tls from 'node:tls'
import { spawn, execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'

const listen = server => new Promise(resolve => server.listen(0,'127.0.0.1',()=>resolve(server.address().port)))
const delay = n => new Promise(r=>setTimeout(r,n))
const onceOpen = ws => new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)})

test('authenticated bridge carries HTTP and websocket and disconnects without replay', {timeout:20000}, async t => {
  const dir=await mkdtemp(join(tmpdir(),'aegis-relay-test-'))
  const key=join(dir,'key.pem'),cert=join(dir,'cert.pem')
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost','-keyout',key,'-out',cert],{stdio:'ignore'})
  const auth=http.createServer((req,res)=>{res.writeHead(req.headers.cookie==='session=admin'?200:401).end()})
  const authPort=await listen(auth)
  const local=http.createServer((req,res)=>{if(req.url==='/cam/sources'){res.setHeader('content-type','application/json');res.end('{"cameras":[]}')}else res.writeHead(404).end()})
  const localWs=new WebSocketServer({server:local})
  localWs.on('connection',ws=>ws.on('message',data=>ws.send(data.toString())))
  const localPort=await listen(local)
  const probe=net.createServer();const gatewayPort=await listen(probe);await new Promise(r=>probe.close(r))
  const token='a'.repeat(48),origin='https://alpadev.test'
  const gateway=spawn(process.execPath,['gateway.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:String(gatewayPort),PUBLIC_ORIGIN:origin,ADMIN_INTERNAL_ORIGIN:`http://127.0.0.1:${authPort}`,BRIDGE_TOKEN:token,SPECTRA_DIST:dir},stdio:'ignore'})
  const proxy=tls.createServer({key:await readFile(key),cert:await readFile(cert)},socket=>{const upstream=net.connect(gatewayPort,'127.0.0.1');socket.pipe(upstream).pipe(socket);socket.on('error',()=>upstream.destroy());upstream.on('error',()=>socket.destroy())})
  const tlsPort=await listen(proxy)
  const agent=spawn(process.execPath,['agent.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,AEGIS_BRIDGE_URL:`wss://localhost:${tlsPort}/aegis-bridge`,AEGIS_BRIDGE_TOKEN:token,AEGIS_LOCAL_ORIGIN:`http://127.0.0.1:${localPort}`,AEGIS_LAB_DATA_DIR:dir,NODE_EXTRA_CA_CERTS:cert,NODE_OPTIONS:'--dns-result-order=ipv4first'},stdio:'ignore'})
  t.after(async()=>{agent.kill();gateway.kill();localWs.close();auth.close();local.close();proxy.close();await rm(dir,{recursive:true,force:true})})
  const base=`http://127.0.0.1:${gatewayPort}`
  let status
  for(let n=0;n<60;n++){try{status=await fetch(base+'/dashboard/aegis/bridge-status',{headers:{cookie:'session=admin'}});if(status.ok&&(await status.json()).bridge)break}catch{}await delay(100)}
  console.log('bridge status checked'); assert.equal((await fetch(base+'/cam/sources')).status,401)
  assert.equal((await fetch(base+'/cam/sources',{headers:{cookie:'session=admin'}})).status,200)
  assert.equal((await fetch(base+'/vision/identify',{method:'POST',headers:{cookie:'session=admin',origin:'https://other.test'}})).status,403)
  console.log('http checks passed'); const browser=new WebSocket(`ws://127.0.0.1:${gatewayPort}/ws`,{headers:{cookie:'session=admin',origin}});await onceOpen(browser)
  console.log('browser ws opened'); const received=new Promise(resolve=>browser.once('message',data=>resolve(data.toString())))
  browser.send('hello');assert.equal(await received,'hello');console.log('ws echo passed')
  const closed=new Promise(resolve=>browser.once('close',resolve));agent.kill();await closed
  for(let n=0;n<30;n++){const r=await fetch(base+'/cam/sources',{headers:{cookie:'session=admin'}});if(r.status===503)return;await delay(100)}
  assert.fail('bridge did not become unavailable')
})
