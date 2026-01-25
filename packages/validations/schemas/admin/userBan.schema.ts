import { z } from "zod"

export const banSchema = z.object({
  reason: z
    .string({ required_error: "Reason is required." })
    .min(1, "Reason is required"),
})

export type BanSchema = z.infer<typeof banSchema>
