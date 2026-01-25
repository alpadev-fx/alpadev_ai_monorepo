import { $Enums } from "@package/db"

import type { ExtendedSession } from "../auth/authOptions"
import type { Prisma } from "@package/db"
import type { User } from "next-auth"

export const ROLES = $Enums.Role

export type RoleTypes = keyof typeof ROLES

// TODO: Add subscription model to schema
export type FullUser = Prisma.UserGetPayload<{
  include: {
    // subscription: true
  }
}>

export type UserSession = User & ExtendedSession
