import { createHash } from "crypto"

import { db } from "@package/db"

import type {
  BanUserByIdData,
  UnbanUserByIdData,
} from "./adminUser.repository.types"
import type {
  CreateVerificationTokenArgs,
  GetPaginatedUsersArgs,
} from "../service/adminUser.service.types"

class AdminUserRepository {
  public getUserById(userId: string) {
    return db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        // subscription: true, // TODO: Add subscription model to schema
        accounts: {
          select: {
            provider: true,
          },
        },
        // bans: {
        //   include: {
        //     bannedBy: { select: { email: true } },
        //     unbannedBy: { select: { email: true } },
        //   },
        // },
        // performedBans: {
        //   include: {
        //     user: { select: { email: true } },
        //     unbannedBy: { select: { email: true } },
        //   },
        // },
        // performedUnbans: {
        //   include: {
        //     user: { select: { email: true } },
        //     bannedBy: { select: { email: true } },
        //   },
        // },
      },
    })
  }

  public getUsersByEmail(email: string) {
    return db.user.findMany({
      where: {
        email: {
          contains: email,
        },
      },
      select: {
        id: true,
        email: true,
      },
      take: 10,
    })
  }

  public getPaginatedUsers(data: GetPaginatedUsersArgs["input"]) {
    const { page, limit } = data

    return db.user.findMany({
      include: {
        // subscription: true, // TODO: Add subscription model to schema
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  public getTotalUsers() {
    return db.user.count()
  }

  public async banUserById(data: BanUserByIdData) {
    // TODO: Add Ban model and isBanned field to schema
    throw new Error("Ban functionality not implemented - schema missing Ban model and isBanned field")
    // const userIdToBan = data.userId
    // await db.$transaction([
    //   db.user.update({
    //     where: { id: userIdToBan },
    //     data: { isBanned: true },
    //   }),
    //   db.ban.create({
    //     data: {
    //       bannedByUserId: data.bannedByUserId,
    //       userId: userIdToBan,
    //       banReason: data.reason,
    //     },
    //   }),
    // ])
  }

  public async getLatestBan(userId: string) {
    // TODO: Add Ban model to schema
    throw new Error("Ban functionality not implemented - schema missing Ban model")
    // return db.ban.findFirst({
    //   where: {
    //     userId,
    //     unbannedAt: null,
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // })
  }

  public async unbanUserById(data: UnbanUserByIdData) {
    // TODO: Add Ban model and isBanned field to schema
    throw new Error("Unban functionality not implemented - schema missing Ban model and isBanned field")
    // const userIdToUnban = data.userId
    // await db.$transaction([
    //   db.user.update({
    //     where: { id: userIdToUnban },
    //     data: { isBanned: false },
    //   }),
    //   db.ban.update({
    //     where: {
    //       id: data.latestBanId,
    //     },
    //     data: {
    //       unbannedAt: new Date(),
    //       unbannedByUserId: data.unbannedByUserId,
    //       unbanReason: data.reason,
    //     },
    //   }),
    // ])
  }

  public async deleteUserById(userId: string) {
    return db.user.delete({
      where: {
        id: userId,
      },
    })
  }

  public async createVerificationToken(
    data: CreateVerificationTokenArgs["input"]
  ) {
    function hashToken(token: string) {
      return createHash("sha256")
        .update(`${token}${process.env.NEXTAUTH_SECRET}`)
        .digest("hex")
    }

    await db.verificationToken.create({
      data: {
        identifier: data.email,
        token: hashToken(data.token),
        // expire in 1 minute
        expires: new Date(Date.now() + 60000),
      },
    })
  }
}

export const adminUserRepository = new AdminUserRepository()
