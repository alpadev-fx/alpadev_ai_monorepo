import { z } from "zod"

export const nameSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name" })
    .min(1, "Name must be atleast 1 character long")
    .max(30, "Name must be at most 30 characters long")
    .refine((name) => /^[A-Za-z\s]+$/.test(name), {
      message: "Name must contain only alphabetic characters",
    }),
})

export type Name = z.infer<typeof nameSchema>

export const planAndIntervalSchema = z.object({
  plan: z.enum(["BASIC", "PRO", "PREMIUM"], {
    required_error: "Please select a plan",
  }),
  interval: z.enum(["monthly", "yearly"], {
    required_error: "Please select a billing interval",
  }),
})

export type PlanAndInterval = z.infer<typeof planAndIntervalSchema>
export type Plan = Pick<PlanAndInterval, "plan">
export type Interval = Pick<PlanAndInterval, "interval">

export const onboardingSchema = z
  .object({
    lookupKey: z.string({
      required_error: "Lookup key is required.",
    }),
  })
  .merge(nameSchema)

export type OnboardingData = z.infer<typeof onboardingSchema>
