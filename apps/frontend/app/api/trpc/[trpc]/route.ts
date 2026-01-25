import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"
import { appRouter, createTRPCContext } from "@package/api"

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error, type }) => {
      console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, {
        error: error.message,
        stack: error.stack,
        type,
        code: error.code,
        cause: error.cause,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
      })

      // Log additional context for database errors
      if (error.message.includes('database') || error.message.includes('MongoDB') || error.message.includes('Prisma')) {
        console.error("Database error context:", {
          NODE_ENV: process.env.NODE_ENV,
          MONGO_URL: process.env.MONGO_URL ? "SET" : "NOT_SET",
          DATABASE: process.env.DATABASE ? "SET" : "NOT_SET",
        })
      }
    },
  })

export { handler as GET, handler as POST }
