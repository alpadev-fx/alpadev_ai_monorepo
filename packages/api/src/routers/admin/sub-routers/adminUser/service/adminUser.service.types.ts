import type {
  UserBanInput,
  UserEmailInput,
  UserIdInput,
  UsersPaginationInput,
} from "./adminUser.input"
import type { UserSession } from "@package/auth/types"

export type GetUserProfileByIdArgs = {
  input: UserIdInput
}

export type GetUsersByEmailArgs = {
  input: UserEmailInput
}

export type UsersWithEmails = { id: string; email: string }[]

export type GetPaginatedUsersArgs = {
  input: UsersPaginationInput
}

export type BanUserByIdArgs = {
  input: UserBanInput
  session: UserSession
}

export type UnbanUserByIdArgs = {
  input: UserBanInput & { latestBanId: string }
  session: UserSession
}

export type DeleteUserByIdArgs = {
  input: UserIdInput
  session: UserSession
}

export type ImpersonateUserByIdArgs = {
  input: UserIdInput
}

export type CreateVerificationTokenArgs = {
  input: {
    email: string
    token: string
  }
}
