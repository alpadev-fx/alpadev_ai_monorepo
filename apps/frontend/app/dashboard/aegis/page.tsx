import { serverSession } from "@package/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AegisAdminPage() {
  const session = await serverSession()
  if (!session) redirect("/login?callbackUrl=%2Fdashboard%2Faegis")
  if ((session.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard/prospects")
  const origin = "https://alpadev-aegis-laboratorio.ledgerfi-0113.chatgpt.site"
  const modules = [
    { label: "Inventario y montaje", view: "inventario", detail: "Laboratorio AEGIS Radar / Spectra de Alpadev." },
    { label: "Activos e inversión", view: "activos", detail: "Mercado colombiano e inversión real, con fuentes." },
    { label: "Gastos y suscripciones", view: "gastos", detail: "Facturas, hosting, dominios, servicios y APIs." },
    { label: "Valor del software", view: "software", detail: "Escenarios de reposición con alcance y evidencia." },
  ]
  return (
    <section className="h-full overflow-y-auto space-y-8 text-white">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-[#ffb0cd]">Alpadev / AEGIS</p>
        <h1 className="!text-2xl md:!text-3xl !leading-tight font-bold tracking-tight">Laboratorio y finanzas</h1>
        <p className="text-sm text-zinc-400">AEGIS es un proyecto de Alpadev. WE BUILD WHAT’S NEXT.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map(m => <a key={m.view} href={`${origin}/?view=${m.view}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-6 hover:border-[#ffb0cd]/50 transition-colors">
          <h2 className="text-lg font-semibold text-[#ffb0cd]">{m.label} ↗</h2>
          <p className="mt-3 text-sm text-zinc-400">{m.detail}</p>
        </a>)}
      </div>
      <p className="text-xs leading-6 text-zinc-500">Panel privado con inicio de sesión propio. Los datos financieros se conservan en el laboratorio; esta página ofrece acceso desde el admin y no replica facturas en la web pública.</p>
    </section>
  )
}
