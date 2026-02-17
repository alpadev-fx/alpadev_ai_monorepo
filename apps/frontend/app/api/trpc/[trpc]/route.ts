import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"
import { headers } from "next/headers"
import { appRouter, createTRPCContext } from "@package/api"
import { auth } from "@/lib/auth"

const handler = async (req: NextRequest) => {
  // Pre-resolve headers for Next.js 15 async compatibility (NextAuth v5-beta calls headers() internally)
  await headers()
  const authSession = await auth()

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext({ ...opts, session: authSession as Parameters<typeof createTRPCContext>[0]["session"] }),
    onError: ({ path, error, type }) => {
      console.error(`tRPC failed on ${path ?? "<no-path>"}:`, {
        error: error.message,
        type,
        code: error.code,
      })
    },
  })
}

export { handler as GET, handler as POST }
