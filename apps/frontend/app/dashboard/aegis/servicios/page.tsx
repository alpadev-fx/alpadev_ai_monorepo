import { serverSession } from "@package/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
const providers = ["Railway", "GCP / Google", "Cloudflare", "Hostinger", "Resend", "Linear", "Anthropic", "OpenAI", "xAI", "Command Code", "ElevenLabs", "Higgsfield", "Hugging Face", "Meshy", "TypeSafe", "Roboflow"]
export default async function ServicesPage() {
  const session = await serverSession()
  if (!session) redirect('/login?callbackUrl=%2Fdashboard%2Faegis%2Fservicios')
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/dashboard/prospects')
  return <section className="h-full overflow-y-auto space-y-6 text-white">
    <a href="/dashboard/aegis" className="text-sm text-[#ffb0cd]">← Centro de mando</a>
    <div><h1 className="text-[24px] md:text-[32px] font-bold">Servicios</h1><p className="mt-2 text-sm text-zinc-400">Catálogo documentado. La presencia en esta lista no confirma una integración, una clave ni un gasto.</p></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{providers.map(name => <article key={name} className="rounded-xl border border-white/10 bg-[#1b1b1b] p-5"><h2 className="font-semibold">{name}</h2><dl className="mt-3 space-y-1 text-sm text-zinc-400"><div><dt className="inline">Integración: </dt><dd className="inline">sin verificar</dd></div><div><dt className="inline">Configuración de clave: </dt><dd className="inline">sin verificar</dd></div><div><dt className="inline">Gasto: </dt><dd className="inline">consultar registros del laboratorio</dd></div></dl></article>)}</div>
  </section>
}
