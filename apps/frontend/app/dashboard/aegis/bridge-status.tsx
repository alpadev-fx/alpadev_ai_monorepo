'use client'
import { useEffect, useState } from 'react'
export default function BridgeStatus() {
  const [state,setState]=useState<'checking'|'connected'|'disconnected'>('checking')
  useEffect(()=>{
    let live=true
    const check=async()=>{try{const r=await fetch('/dashboard/aegis/bridge-status',{cache:'no-store'});const d=await r.json();if(live)setState(r.ok && d.bridge?'connected':'disconnected')}catch{if(live)setState('disconnected')}}
    void check();const timer=setInterval(check,15000);return()=>{live=false;clearInterval(timer)}
  },[])
  return <p className="rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-sm text-zinc-300" role="status">{state==='connected'?'Puente con el Mac conectado. El estado de cada cámara y dispositivo se comprueba en Spectra.':state==='disconnected'?'Puente con el Mac desconectado. El laboratorio y los dispositivos locales no están disponibles.':'Comprobando conexión con el Mac…'}</p>
}
