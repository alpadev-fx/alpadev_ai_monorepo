import { z } from "zod"

import { userService } from "./service/user.service"
import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const nameSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name" })
    .min(1, "Name must be atleast 1 character long")
    .max(30, "Name must be at most 30 characters long")
    .refine((name) => /^[A-Za-z\s]+$/.test(name), {
      message: "Name must contain only alphabetic characters",
    }),
})

export const onboardingSchema = z
  .object({
    lookupKey: z.string({
      required_error: "Lookup key is required.",
    }),
  })
  .merge(nameSchema)

export const userRouter = createTRPCRouter({
  updateUserOnboarding: protectedProcedure
    .input(onboardingSchema)
    .mutation(({ input, ctx }: { input: any, ctx: any }) => {
      return userService.updateUserOnboarding({
        input,
        session: ctx.session.user,
      })
    }),
  getMe: protectedProcedure.query(({ ctx }: { ctx: any }) => {
    return userService.getUserMe(ctx.session.user)
  }),
  changeName: protectedProcedure
    .input(nameSchema)
    .mutation(({ ctx, input }: { ctx: any, input: any }) => {
      return userService.changeName({ input, session: ctx.session.user })
    }),
  deleteMe: protectedProcedure.mutation(({ ctx }: { ctx: any }) => {
    return userService.deleteUserById(ctx.session.user)
  }),
  inviteUser: protectedProcedure
    .input(z.object({ email: z.string().email(), name: z.string() }))
    .mutation(({ input }: { input: any }) => {
      return userService.inviteUser(input)
    }),
})
