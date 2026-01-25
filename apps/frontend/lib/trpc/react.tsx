"use client"

import type { AppRouter } from "@package/api"

import { useState } from "react"
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

let clientQueryClientSingleton: QueryClient | undefined = undefined

export const api = createTRPCReact<AppRouter>()

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const getQueryClient = () => {
    if (typeof window === "undefined") {
      // Server: always make a new query client
      return createQueryClient()
    } else {
      // Browser: use singleton pattern to keep the same query client
      return (clientQueryClientSingleton ??= createQueryClient())
    }
  }

  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // SWR Strategy: Data considered fresh for 5 minutes
          staleTime: 1000 * 60 * 5,
          // Keep data in cache for 30 minutes
          gcTime: 1000 * 60 * 30,
          // Revalidate when user returns to tab
          refetchOnWindowFocus: true,
          // Revalidate on network reconnect
          refetchOnReconnect: true,
          retry: 2,
        },
      },
      queryCache: new QueryCache({}),
      mutationCache: new MutationCache({}),
    })

  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NEXT_PUBLIC_APP_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
          url: getBaseUrl() + "/api/trpc",
          headers() {
            const headers = new Headers()

            headers.set("x-trpc-source", "nextjs-react")

            return headers
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_ENV === "production"
  )
    return process.env.NEXT_PUBLIC_APP_URL

  return "http://localhost:3000"
}
