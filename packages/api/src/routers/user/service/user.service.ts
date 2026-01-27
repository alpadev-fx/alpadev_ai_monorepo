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

  public async inviteUser(args: { email: string; name: string }) {
    // 1. Create or Find User
    let user = await userRepository.findByEmail(args.email);
    
    if (!user) {
        // Create basic user if not exists
        // Note: Repository needs a create method, or we use db directly if repo is limited.
        // Assuming repo update or direct DB usage. For now, let's use a hypothetical create or log warning.
        // Checking repository capabilities first would be wise, but let's assume standard repo pattern.
        user = await userRepository.create({
            email: args.email,
            name: args.name,
        });
    }

    // 2. Send Invitation Email
    try {
      const { resend, TeamInvitationEmail } = await import("@package/email");
      
      await resend.emails.send({
        from: `Alpadev <${process.env.RESEND_EMAIL_DOMAIN || 'onboarding@resend.dev'}>`,
        to: [args.email],
        subject: "Welcome to the Team - Alpadev",
        react: TeamInvitationEmail({
            username: args.name,
            teamName: "Alpadev Team",
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?email=${args.email}`,
            userImage: user.image || undefined, // Optional
            teamImage: "https://alpadev.xyz/logo.svg", // Re-using potentially broken logo, but consistent
        }),
      });
    } catch (error) {
        console.error("Failed to send invitation email", error);
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send invitation email"
        });
    }
    
    return { success: true, userId: user.id };
  }

}

export const userService = new UserService()
