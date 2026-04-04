/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { serverSession } from "@package/auth"
import { db } from "@package/db"
import { featureFlags } from "@package/utils"
import { initTRPC, TRPCError } from "@trpc/server"
import { ActivityService } from "./routers/activity/service/activity.service"
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import superjson from "superjson"
import { ZodError } from "zod"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
type CreateContextOptions = (FetchCreateContextFnOptions | { headers: Headers }) & {
  session?: { user: { id: string; name?: string | null; email?: string | null; role: string; hasOnboarded?: boolean; isBanned?: boolean } } | null
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  // Use injected session (from v5-beta auth()) if available, otherwise fall back to v4 serverSession
  const session = opts.session !== undefined ? opts.session : await serverSession()

  if ("req" in opts) {
    const { req, resHeaders, info } = opts

    return {
      db,
      session,
      req,
      resHeaders,
      headers: req.headers,
      info,
    }
  }

  const req = new Request("http://localhost/api/trpc", {
    headers: opts.headers,
  })
  const resHeaders = new Headers()
  const info: FetchCreateContextFnOptions["info"] = {
    accept: null,
    type: "unknown",
    isBatchCall: false,
    calls: [],
    connectionParams: null,
    signal: new AbortController().signal,
    url: null,
  }

  return {
    db,
    session,
    req,
    resHeaders,
    headers: req.headers,
    info,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
})

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(
  ({ ctx, next, path }) => {
    const user = ctx.session?.user

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    // Check if the user has completed the onboarding process
    if (
      !user.hasOnboarded &&
      path !== "user.updateUserOnboarding" &&
      featureFlags.onboardingFlow
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You need to complete the onboarding process.",
      })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user },
      },
    })
  }
)

/**
 * Protected (admin) procedure
 *
 * If you want a query or mutation to ONLY be accessible to admin users, use this.
 *
 * @see https://trpc.io/docs/procedures
 */
export const adminProcedure = t.procedure.use(
  ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    if (ctx.session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN" })
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  }
)

/**
 * Chief procedure — ADMIN or CHIEF role
 *
 * Chiefs can view vendor activity and manage vendor permissions within their assigned scope.
 * They cannot access full admin features (user CRUD, statistics, infrastructure).
 */
export const chiefProcedure = protectedProcedure.use(
  ({ ctx, next }) => {
    if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "CHIEF") {
      throw new TRPCError({ code: "FORBIDDEN" })
    }
    return next({ ctx })
  }
)

/**
 * Logged procedure — tracks vendor activity
 *
 * Extends protectedProcedure with fire-and-forget activity logging.
 * Only logs non-admin users. Use on endpoints where vendor tracking matters.
 */
// Sanitize input for logging — strip passwords, tokens, large payloads
function sanitizeInput(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null
  const input = raw as Record<string, unknown>
  const sanitized: Record<string, unknown> = {}
  const SKIP = new Set(["password", "token", "secret", "accessToken", "refreshToken"])
  for (const [k, v] of Object.entries(input)) {
    if (SKIP.has(k)) continue
    if (typeof v === "string" && v.length > 200) {
      sanitized[k] = v.slice(0, 200) + "...[truncated]"
    } else {
      sanitized[k] = v
    }
  }
  return sanitized
}

export const loggedProcedure = protectedProcedure.use(
  async ({ ctx, next, path, getRawInput }) => {
    const start = Date.now()
    const rawInput = await getRawInput().catch(() => null)
    const result = await next({ ctx })
    const duration = Date.now() - start

    // Log all non-admin users (VENDOR, CHIEF, USER)
    if (ctx.session.user.role !== "ADMIN") {
      const [resource, action] = path.split(".")
      const inputData = sanitizeInput(rawInput)
      const activityService = new ActivityService(ctx.db)
      activityService.log({
        userId: ctx.session.user.id,
        action: path,
        resource: resource ?? path,
        resourceId: (inputData?.id as string) ?? (inputData?.userId as string) ?? null,
        method: action?.startsWith("get") || action === "metrics" || action === "export" ? "query" : "mutation",
        details: inputData ? (inputData as Record<string, unknown>) : null,
        success: result.ok,
        duration,
        ipAddress: ctx.req.headers.get("x-forwarded-for") ?? ctx.req.headers.get("x-real-ip") ?? null,
        userAgent: ctx.req.headers.get("user-agent") ?? null,
      })
    }

    return result
  }
)
