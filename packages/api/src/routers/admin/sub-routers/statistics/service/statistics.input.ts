import { z } from "zod"

export const userStatisticsInput = z.object({
  from: z.date(),
  to: z.date(),
})

export type UserStatisticsInput = z.infer<typeof userStatisticsInput>
