import {
  userBanInput,
  userEmailInput,
  userIdInput,
  usersPaginationInput,
} from "./service/adminUser.input"
import { adminUserService } from "./service/adminUser.service"
import { adminProcedure, createTRPCRouter } from "../../../../trpc"

export const adminUserRouter = createTRPCRouter({
  getById: adminProcedure.input(userIdInput).query(({ input }) => {
    return adminUserService.getUserProfileById({ input })
  }),

  getByEmail: adminProcedure.input(userEmailInput).query(({ input }) => {
    return adminUserService.getUsersByEmail({ input })
  }),

  list: adminProcedure.input(usersPaginationInput).query(({ input }) => {
    return adminUserService.getPaginatedUsers({ input })
  }),

  banById: adminProcedure.input(userBanInput).mutation(({ input, ctx }) => {
    return adminUserService.banUserById({ input, session: ctx.session!.user })
  }),

  unbanById: adminProcedure.input(userBanInput).mutation(({ input, ctx }) => {
    return adminUserService.unbanUserById({ input, session: ctx.session!.user })
  }),

  deleteById: adminProcedure.input(userIdInput).mutation(({ input, ctx }) => {
    return adminUserService.deleteUserById({
      input,
      session: ctx.session!.user,
    })
  }),

  impersonateById: adminProcedure.input(userIdInput).query(({ input }) => {
    return adminUserService.impersonateUserById({ input })
  }),
})
