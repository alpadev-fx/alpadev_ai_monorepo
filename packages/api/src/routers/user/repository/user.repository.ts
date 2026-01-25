import { db } from "@package/db"

import type {
  ChangeNameByIdData,
  UpdateUserOnboardingByIdData,
} from "./user.repository.types"

class UserRepository {
  public getUserById(userId: string) {
    return db.user.findUnique({
      where: {
        id: userId,
      },
      // include: { subscription: true }, // TODO: Add subscription model to schema
    })
  }

  getSubscriptionByUserId(userId: string) {
    // TODO: Add subscription model to schema
    throw new Error("Subscription functionality not implemented - schema missing Subscription model")
    // return db.subscription.findUnique({
    //   where: { userId },
    // })
  }

  public async changeNameById(data: ChangeNameByIdData) {
    await db.user.update({
      where: {
        id: data.userId,
      },
      data: {
        name: data.name,
      },
    })
  }

  public updateUserOnboardingById(data: UpdateUserOnboardingByIdData) {
    return db.user.update({
      where: { id: data.userId },
      data: {
        // hasOnboarded: true, // TODO: Add hasOnboarded field to User schema
        name: data.onboardingData.name,
      },
    })
  }
}

export const userRepository = new UserRepository()
