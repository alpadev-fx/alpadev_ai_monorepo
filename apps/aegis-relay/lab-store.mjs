import { mkdir, readFile, open, rename, unlink, rmdir } from 'node:fs/promises'
import { join, isAbsolute } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validateLab } from './lab-validation.mjs'

const dir = process.env.AEGIS_LAB_DATA_DIR
const json = (status, body) => ({ status, body: Buffer.from(JSON.stringify(body)) })
let writer = Promise.resolve()
export async function localLab(method, bytes) {
  if (!dir || !isAbsolute(dir)) return json(503,{error:'Almacenamiento local no configurado.'})
  const file=join(dir,'lab-state.json')
  const read=async()=>{try{return JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}}
  if(method==='GET') {try {const state=await read();return state?json(200,state):json(503,{error:'Laboratorio local sin inicializar.'})} catch{return json(503,{error:'Almacenamiento local no disponible.'})}}
  if(method!=='PUT')return json(405,{error:'Método no permitido.'})
  if(bytes.length>2_000_000)return json(413,{error:'Archivo demasiado grande.'})
  let body;try{body=JSON.parse(bytes)}catch{return json(400,{error:'JSON inválido.'})}
  const error=validateLab(body);if(error)return json(400,{error})
  let release;const previous=writer;writer=new Promise(r=>release=r);await previous
  try {
    await mkdir(dir,{recursive:true,mode:0o700});const lock=join(dir,'.writer-lock')
    try{await mkdir(lock,{mode:0o700})}catch(e){if(e.code==='EEXIST')return json(503,{error:'Otro proceso está guardando; vuelve a intentar.'});throw e}
    try {
      const current=await read();if((current?.revision??0)!==body.revision)return json(409,{error:'Hay una versión más reciente. Exporta tus cambios y recarga.'})
      const state={revision:body.revision+1,data:body.data,updated:new Date().toISOString()},tmp=join(dir,`.lab-${randomUUID()}.tmp`)
      try{const f=await open(tmp,'wx',0o600);try{await f.writeFile(JSON.stringify(state));await f.sync()}finally{await f.close()}await rename(tmp,file)}finally{await unlink(tmp).catch(()=>{})}
      return json(200,{revision:state.revision,updated:state.updated})
    } finally {await rmdir(lock)}
  }catch{return json(503,{error:'No se pudo guardar el laboratorio local.'})}finally{release()}
}
