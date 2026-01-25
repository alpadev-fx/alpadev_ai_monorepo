import { TRPCError } from "@trpc/server"

import type {
  ChangeNameArgs,
  UpdateUserOnboardingArgs,
} from "./user.service.types"
import type { UserSession } from "@package/auth/types"

import { adminUserRepository } from "../../admin/sub-routers/adminUser/repository/adminUser.repository"
import { userRepository } from "../repository/user.repository"

class UserService {
  public async updateUserOnboarding(args: UpdateUserOnboardingArgs) {
    if (!args.session) {
      throw new TRPCError({
        message: "You need to be logged in to onboard.",
        code: "UNAUTHORIZED",
      })
    }

    if (args.session.hasOnboarded) {
      throw new TRPCError({
        message: "You have already onboarded.",
        code: "FORBIDDEN",
      })
    }

    // update user with onboarding data
    await userRepository.updateUserOnboardingById({
      userId: args.session.id,
      onboardingData: args.input,
    })
  }

  public getUserMe(session: UserSession) {
    return userRepository.getUserById(session.id)
  }

  public async changeName(args: ChangeNameArgs) {
    await userRepository.changeNameById({
      name: args.input.name,
      userId: args.session.id,
    })
  }

  public async deleteUserById(session: UserSession) {
    await adminUserRepository.deleteUserById(session.id)
  }
}

export const userService = new UserService()
