import { serverSession } from '@package/auth'
export const dynamic = 'force-dynamic'
export async function GET() {
  const session = await serverSession()
  const isAdmin = !!session && (session.user as { role?: string })?.role === 'ADMIN'
  return new Response(null, { status: isAdmin ? 200 : 401, headers: { 'Cache-Control': 'no-store' } })
}
