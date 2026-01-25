import { Language } from "@package/db"
import { z } from "zod"

export const newsletterSubscribeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Email address is invalid"),
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name must contain at most 100 characters")
    .optional(),
  language: z.nativeEnum(Language).default(Language.en),
})

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>
