import { z } from "zod"

export const banSchema = z.object({
  reason: z
    .string({ required_error: "Reason is required." })
    .min(1, "Reason is required"),
})

export const userIdInput = z.object({
  userId: z.string().min(1),
})

export type UserIdInput = z.infer<typeof userIdInput>

export const userEmailInput = z.object({
  email: z.string().min(1).max(100),
})

export type UserEmailInput = z.infer<typeof userEmailInput>

export const usersPaginationInput = z.object({
  page: z.number().int(),
  limit: z.number().int().positive(),
})

export type UsersPaginationInput = z.infer<typeof usersPaginationInput>

export const userBanInput = banSchema.merge(
  z.object({
    userId: z.string(),
  })
)

export type UserBanInput = z.infer<typeof userBanInput>
