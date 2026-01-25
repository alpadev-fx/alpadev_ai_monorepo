import { z } from 'zod'
import type { ChangeNameArgs } from "../service/user.service.types"
import { onboardingSchema } from '../user.router'
export type OnboardingData = z.infer<typeof onboardingSchema>

export type ChangeNameByIdData = ChangeNameArgs["input"] & {
  userId: string
}

export type UpdateUserOnboardingByIdData = {
  userId: string
  onboardingData: Omit<OnboardingData, "lookupKey">
}
