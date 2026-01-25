import type { UserSession } from "@package/auth/types"
import {z} from 'zod';

import { onboardingSchema, nameSchema } from "../user.router";
export type OnboardingData = z.infer<typeof onboardingSchema>

export type Name = z.infer<typeof nameSchema>

export type UpdateUserOnboardingArgs = {
  input: OnboardingData
  session: UserSession | undefined
}

export type ChangeNameArgs = {
  input: Name
  session: UserSession
}
