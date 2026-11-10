"use client"

import { useState } from "react"

type Provider = "railway" | "gcp" | "combined"

export default function InfrastructurePage() {
  const [provider, setProvider] = useState<Provider>("railway")

  return (
    <div className="space-y-6 h-full overflow-y-auto text-white">
      <div>
        <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight">Infraestructura</h1>
        <p className="mt-1 text-sm text-zinc-400">Producción en Railway y consulta del proyecto histórico de GCP.</p>
      </div>
      <div role="group" aria-label="Proveedor de infraestructura" className="flex flex-wrap gap-2">
        {([['railway', 'Railway'], ['gcp', 'GCP histórico'], ['combined', 'Combinado']] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setProvider(id)} aria-pressed={provider === id} className={`rounded-lg px-4 py-2 text-sm ${provider === id ? 'bg-white text-black' : 'bg-[#161616] text-zinc-300'}`}>{label}</button>
        ))}
      </div>
      {(provider === "railway" || provider === "combined") && <section className="rounded-2xl border border-white/10 bg-[#161616] p-6 space-y-2">
        <h2 className="font-semibold">Railway · producción</h2>
        <p className="text-sm text-zinc-400">Servicios: alpadev-admin y alpadev-hechizo. Dominio público: alpadev.xyz.</p>
        <p className="text-xs text-zinc-500">Inventario documentado el 10 de noviembre de 2026. Estado actual, métricas y costos: sin conexión de lectura en este panel.</p>
      </section>}
      {provider === "combined" && <div className="space-y-2"><p className="text-sm text-zinc-400">No se suman costos: las fuentes no están conciliadas y Railway no dispone de métricas en este panel.</p><a className="text-sm text-[#ffb0cd]" href="/dashboard/aegis/servicios">Ver catálogo de otros servicios y su estado de integración →</a></div>}
      {(provider === "gcp" || provider === "combined") && <section className="space-y-4">
        <div><h2 className="font-semibold">GCP · alpadev-ai-prod</h2><p className="text-xs text-zinc-500">Consulta de la integración existente; los datos dependen de su disponibilidad y no representan Railway.</p></div>
        <p className="rounded-xl bg-[#161616] p-4 text-sm text-zinc-400">Lectura del 10 nov 2026, 06:53:16 UTC: Cloud Run alpadev-frontend Ready=True, revisión alpadev-frontend-00052-rlz; URL histórica respondió HTTP 200. Facturación habilitada, importes no consultados. API Compute deshabilitada: inventario de VM desconocido.</p><p className="rounded-xl bg-[#161616] p-4 text-sm text-zinc-400">Métricas y facturación no verificadas. La integración anterior puede sustituir consultas fallidas por ceros y producir estimaciones; se conservan sus componentes, pero no se presentan como lecturas confirmadas.</p>
      </section>}
    </div>
  )
}
