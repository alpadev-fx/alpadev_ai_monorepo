import { createTRPCRouter, adminProcedure, protectedProcedure } from "../../trpc"
import { PermissionService } from "./service/permission.service"
import {
  assignPermissionSchema,
  updatePermissionSchema,
  revokePermissionSchema,
  getPermissionsByUserSchema,
} from "@package/validations"

export const permissionRouter = createTRPCRouter({
  assign: adminProcedure
    .input(assignPermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new PermissionService(ctx.db)
      return service.assign(input)
    }),

  update: adminProcedure
    .input(updatePermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new PermissionService(ctx.db)
      return service.update(input)
    }),

  revoke: adminProcedure
    .input(revokePermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new PermissionService(ctx.db)
      return service.revoke(input.userId, input.resource)
    }),

  getByUser: adminProcedure
    .input(getPermissionsByUserSchema)
    .query(async ({ ctx, input }) => {
      const service = new PermissionService(ctx.db)
      return service.getByUser(input.userId)
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const service = new PermissionService(ctx.db)
    return service.getAll()
  }),

  myPermissions: protectedProcedure.query(async ({ ctx }) => {
    const service = new PermissionService(ctx.db)
    return service.getByUser(ctx.session.user.id)
  }),
})
