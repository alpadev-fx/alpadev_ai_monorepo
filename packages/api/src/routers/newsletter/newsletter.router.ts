import { newsletterSubscribeSchema } from "@package/validations"

import { createTRPCRouter, publicProcedure } from "../../trpc"
import { NewsletterService } from "./service/newsletter.service"

const newsletterService = new NewsletterService()

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(newsletterSubscribeSchema)
    .mutation(async ({ input }) => {
      return await newsletterService.subscribe(input)
    }),
})
