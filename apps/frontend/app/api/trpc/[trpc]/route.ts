import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { appRouter, createTRPCContext } from "@package/api"
import { authOptions } from "@/lib/auth"

const handler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions)

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) =>
      createTRPCContext({
        ...opts,
        session: session as Parameters<typeof createTRPCContext>[0]["session"],
      }),
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
