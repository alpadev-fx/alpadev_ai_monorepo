import { getServerSession } from "next-auth"

import authOptions from "../auth/authOptions"

export const serverSession = async () => {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error("[auth] getServerSession failed", error)
    return null
  }
}
