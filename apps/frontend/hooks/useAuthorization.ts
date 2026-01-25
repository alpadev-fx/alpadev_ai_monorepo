"use client"

import { useCallback } from "react"

import type { RoleTypes } from "@package/auth/types"

import { useAuth } from "./useAuth"

export function useAuthorization() {
  const { user } = useAuth()

  const checkAccess = useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      return allowedRoles.includes(user?.role as RoleTypes)
    },
    [user?.role]
  )

  return { checkAccess, role: user?.role }
}
