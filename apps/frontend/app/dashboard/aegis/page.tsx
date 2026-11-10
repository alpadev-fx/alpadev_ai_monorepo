import { serverSession } from "@package/auth"
import { redirect } from "next/navigation"
import BridgeStatus from './bridge-status'

export const dynamic = "force-dynamic"
export default async function AegisAdminPage() {
  const session = await serverSession()
  if (!session) redirect('/login?callbackUrl=%2Fdashboard%2Faegis')
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/dashboard/prospects')
  const modules = [
    { number:'01', label:'Spectra', href:'/dashboard/aegis/spectra/', detail:'Cámaras, radar y control del sistema local.', meta:'CENTRO DE MANDO' },
    { number:'02', label:'Laboratorio', href:'/dashboard/aegis/lab', detail:'Componentes, montaje, pruebas y evidencias.', meta:'AEGIS RADAR / SPECTRA' },
    { number:'03', label:'Finanzas', href:'/dashboard/aegis/lab?view=gastos', detail:'Gastos, suscripciones y registros del laboratorio.', meta:'REGISTROS PRIVADOS' },
    { number:'04', label:'Servicios', href:'/dashboard/aegis/servicios', detail:'Proveedores y estado de sus integraciones.', meta:'ALPADEV' },
    { number:'05', label:'Infraestructura', href:'/dashboard/infrastructure', detail:'Railway, GCP histórico y vista combinada.', meta:'CLOUD' },
  ]
  return <section className="h-full overflow-y-auto text-[#f2f4f6]">
    <div className="max-w-[1120px]">
      <p className="brand-overline">ALPADEV / AEGIS</p>
      <div className="mt-5 grid gap-5 border-b border-[#232830] pb-8 md:grid-cols-[1fr_360px] md:items-end">
        <div><h1 className="brand-heading">Centro de mando<span className="text-[#8d96a0]">.</span></h1><p className="brand-copy mt-4 max-w-xl">Todo tu proyecto AEGIS, en un solo lugar.</p></div>
        <BridgeStatus />
      </div>
      <div className="mt-8 flex items-center justify-between border-b border-[#343b46] pb-3"><h2 className="brand-label">ESPACIOS DE TRABAJO</h2><span className="brand-label">05 / MÓDULOS</span></div>
      <div>{modules.map(m=><a key={m.number} href={m.href} className="group grid gap-3 border-b border-[#232830] py-6 transition-colors hover:bg-white/[0.025] sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-center sm:px-3">
        <span className="brand-label">{m.number}</span><span><span className="block text-[21px] font-medium tracking-tight">{m.label}</span><span className="mt-1 block text-[14px] text-[#8d96a0]">{m.detail}</span></span><span className="flex items-center justify-between gap-8"><span className="brand-label">{m.meta}</span><span aria-hidden="true" className="text-xl text-[#8d96a0] group-hover:text-white">↗</span></span>
      </a>)}</div>
      <p className="brand-label mt-8 pb-8">ALPADEV · CARTAGENA DE INDIAS, COLOMBIA</p>
    </div>
  </section>
}
