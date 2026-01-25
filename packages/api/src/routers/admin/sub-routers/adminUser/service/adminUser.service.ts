import { randomBytes } from "crypto"

import { TRPCError } from "@trpc/server"

import type {
  BanUserByIdArgs,
  DeleteUserByIdArgs,
  GetPaginatedUsersArgs,
  GetUserProfileByIdArgs,
  GetUsersByEmailArgs,
  ImpersonateUserByIdArgs,
  UsersWithEmails,
} from "./adminUser.service.types"

import { userRepository } from "../../../../user/repository/user.repository"
import { adminUserRepository } from "../repository/adminUser.repository"

class AdminUserService {
  public async getUserProfileById(args: GetUserProfileByIdArgs) {
    const user = await adminUserRepository.getUserById(args.input.userId)

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." })
    }

    return user
  }

  public async getUsersByEmail(args: GetUsersByEmailArgs) {
    const users = await adminUserRepository.getUsersByEmail(args.input.email)

    const usersWithEmails = users.filter(
      (user) => user.email !== null
    ) as UsersWithEmails

    return usersWithEmails
  }

  public async getPaginatedUsers(args: GetPaginatedUsersArgs) {
    const allowedLimits = [10, 20, 30, 40, 50]
    const { limit, page } = args.input

    if (!allowedLimits.includes(limit)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid limit." })
    }

    if (page < 1) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid page." })
    }

    const totalUsers = await adminUserRepository.getTotalUsers()
    const totalPages = Math.ceil(totalUsers / limit)
    const hasMore = page < totalPages

    if (page > totalPages) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid page. You can't go beyond the last page.",
      })
    }

    const users = await adminUserRepository.getPaginatedUsers(args.input)
    const pagination = { totalPages, hasMore, currentPage: page, limit }

    return { users, pagination }
  }

  public async banUserById(args: BanUserByIdArgs) {
    const userIdToBan = args.input.userId

    if (userIdToBan === args.session.id) {
      throw new TRPCError({
        message: "You can't ban yourself.",
        code: "BAD_REQUEST",
      })
    }

    const userToBan = await userRepository.getUserById(userIdToBan)

    if (!userToBan) {
      throw new TRPCError({ message: "User not found.", code: "NOT_FOUND" })
    }

    // TODO: Add isBanned field to User schema
    // if (userToBan.isBanned) {
    //   throw new TRPCError({
    //     message: "User is already banned.",
    //     code: "BAD_REQUEST",
    //   })
    // }

    try {
      await adminUserRepository.banUserById({
        ...args.input,
        bannedByUserId: args.session.id,
      })
    } catch (error) {
      throw new TRPCError({
        message: "Failed to ban user.",
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    return { id: userIdToBan }
  }

  public async unbanUserById(args: BanUserByIdArgs) {
    const userIdToUnban = args.input.userId

    if (userIdToUnban === args.session.id) {
      throw new TRPCError({
        message: "You can't ban yourself.",
        code: "BAD_REQUEST",
      })
    }

    const userToUnban = await userRepository.getUserById(userIdToUnban)

    if (!userToUnban) {
      throw new TRPCError({ message: "User not found.", code: "NOT_FOUND" })
    }

    // TODO: Add isBanned field to User schema
    // if (!userToUnban.isBanned) {
    //   throw new TRPCError({
    //     message: "User is already unbanned.",
    //     code: "BAD_REQUEST",
    //   })
    // }
    // TODO: Add Ban model to schema
    throw new TRPCError({
      message: "Unban functionality not implemented - schema missing Ban model",
      code: "NOT_IMPLEMENTED",
    })
    // const latestBan = await adminUserRepository.getLatestBan(userIdToUnban)

    // if (!latestBan) {
    //   throw new TRPCError({
    //     message: "User is not banned.",
    //     code: "BAD_REQUEST",
    //   })
    // }

    // try {
    //   await adminUserRepository.unbanUserById({
    //     ...args.input,
    //     latestBanId: latestBan.id,
    //     unbannedByUserId: args.session.id,
    //   })
    // } catch (error) {
    //   throw new TRPCError({
    //     message: "Failed to unban user.",
    //     code: "INTERNAL_SERVER_ERROR",
    //   })
    // }

    // return { id: userIdToUnban }
  }

  public async deleteUserById(args: DeleteUserByIdArgs) {
    const userIdToDelete = args.input.userId

    if (userIdToDelete === args.session.id) {
      throw new TRPCError({
        message: "You can't delete your own account.",
        code: "BAD_REQUEST",
      })
    }

    try {
      await adminUserRepository.deleteUserById(userIdToDelete)
    } catch (error) {
      throw new TRPCError({
        message: "Failed to delete user.",
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    return { id: userIdToDelete }
  }

  public async impersonateUserById(args: ImpersonateUserByIdArgs) {
    const user = await userRepository.getUserById(args.input.userId)

    if (!user) {
      throw new TRPCError({ message: "User not found.", code: "NOT_FOUND" })
    }

    if (!user.email) {
      throw new TRPCError({
        message: "User does not have an email.",
        code: "BAD_REQUEST",
      })
    }

    const token = randomBytes(32).toString("hex")

    await adminUserRepository.createVerificationToken({
      email: user.email,
      token,
    })

    const params = new URLSearchParams({
      callbackUrl: process.env.NEXTAUTH_URL as string,
      email: user.email,
      token,
    })

    return `${process.env.NEXTAUTH_URL}/api/auth/callback/email?${params}`
  }
}

export const adminUserService = new AdminUserService()
