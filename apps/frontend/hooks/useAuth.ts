import { useCallback } from "react"

import { isSubscribed } from "@package/utils"
import { signIn, signOut, useSession } from "next-auth/react"

import type { RouterOutputs } from "@package/api"

import { api } from "@/lib/trpc/react"

type UserInitializerProps = {
  initialUser?: RouterOutputs["user"]["getMe"]
}

type SubscriptionInput = Parameters<typeof isSubscribed>[0]

export function useAuth({ initialUser }: UserInitializerProps = {}) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const userQuery = api.user.getMe.useQuery(undefined, {
    enabled: !!session,
    initialData: initialUser,
  })

  const handleAuth = useCallback(async () => {
    if (isAuthenticated) {
      await signOut()
    } else {
      await signIn()
    }
  }, [isAuthenticated])

  const subscription = (userQuery.data as {
    subscription?: SubscriptionInput
  } | undefined)?.subscription

  return {
    isAuthenticated,
    isSubscribed: isSubscribed(subscription),
    userQuery,
    user: userQuery.data,
    handleAuth,
    signIn,
    signOut,
  }
}
