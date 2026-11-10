import { serverSession } from "@package/auth"
import { redirect } from "next/navigation"
import BridgeStatus from './bridge-status'

export const dynamic = "force-dynamic"
export default async function AegisAdminPage() {
  const session = await serverSession()
  if (!session) redirect('/login?callbackUrl=%2Fdashboard%2Faegis')
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/dashboard/prospects')
  const modules = [
    { label: 'Laboratorio', href: '/dashboard/aegis/lab', detail: 'Inventario, montaje, evidencias, gastos y valoración del software.' },
    { label: 'Finanzas del laboratorio', href: '/dashboard/aegis/lab?view=gastos', detail: 'Gastos, suscripciones y registros financieros dentro de Alpadev.' },
    { label: 'Servicios', href: '/dashboard/aegis/servicios', detail: 'Proveedores documentados y estado de su integración.' },
    { label: 'Infraestructura', href: '/dashboard/infrastructure', detail: 'Railway, GCP histórico y vista combinada.' },
    { label: 'Spectra · centro de mando', href: '/dashboard/aegis/spectra/', detail: 'Abrir la aplicación Spectra y conectar con los dispositivos del laboratorio local.' },
  ]
  return <section className="h-full overflow-y-auto space-y-8 text-white">
    <div className="space-y-3"><p className="text-xs uppercase tracking-widest text-[#ffb0cd]">Alpadev / AEGIS</p><h1 className="text-[24px] md:text-[32px] leading-tight font-bold tracking-tight">Centro de mando</h1><p className="text-sm text-zinc-400">AEGIS Radar / Spectra · laboratorio y operaciones</p></div>
    <BridgeStatus />
    <div className="grid gap-4 md:grid-cols-2">{modules.map(m => <a key={m.href} href={m.href} className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-6 hover:border-[#ffb0cd]/50 transition-colors"><h2 className="text-lg font-semibold text-[#ffb0cd]">{m.label} →</h2><p className="mt-3 text-sm text-zinc-400">{m.detail}</p></a>)}</div>
  </section>
}
