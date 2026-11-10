import { serverSession } from "@package/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const session = await serverSession()
  if (!session) redirect('/login?callbackUrl=%2Fdashboard%2Faegis%2Flab')
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/dashboard/prospects')
  return children
}
