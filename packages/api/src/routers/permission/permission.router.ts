import { createTRPCRouter, adminProcedure, chiefProcedure, protectedProcedure } from "../../trpc"
import { PermissionService } from "./service/permission.service"
import { TRPCError } from "@trpc/server"
import {
  assignPermissionSchema,
  updatePermissionSchema,
  revokePermissionSchema,
  getPermissionsByUserSchema,
} from "@package/validations"

export const permissionRouter = createTRPCRouter({
  // ADMIN only — full permission management
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

  // CHIEF + ADMIN — can view permissions
  getByUser: chiefProcedure
    .input(getPermissionsByUserSchema)
    .query(async ({ ctx, input }) => {
      const service = new PermissionService(ctx.db)
      return service.getByUser(input.userId)
    }),

  getAll: chiefProcedure.query(async ({ ctx }) => {
    const service = new PermissionService(ctx.db)
    return service.getAll()
  }),

  // CHIEF — assign/revoke cities to vendors (only within chief's own scope)
  assignVendorScope: chiefProcedure
    .input(assignPermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN"

      // Chiefs can only manage VENDOR permissions for "prospect" resource
      if (!isAdmin) {
        if (input.resource !== "prospect") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Chiefs can only manage prospect permissions for vendors" })
        }

        // Verify target user is a VENDOR
        const targetUser = await ctx.db.user.findUnique({ where: { id: input.userId }, select: { role: true } })
        if (!targetUser || targetUser.role !== "VENDOR") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Chiefs can only manage vendor permissions" })
        }

        // Verify chief has permission — no permission record = no delegation rights
        const service = new PermissionService(ctx.db)
        const chiefPerm = await service.checkPermission(ctx.session.user.id, "prospect", "read")
        if (!chiefPerm) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You have no prospect permissions to delegate" })
        }

        // Validate ALL scope dimensions against chief's own scope
        const chiefScope = (chiefPerm.scope ?? {}) as { ciudad?: string[]; estado?: string[]; pais?: string[]; nicho?: string[] }
        const requestedScope = (input.scope ?? {}) as { ciudad?: string[]; estado?: string[]; pais?: string[]; nicho?: string[] }

        for (const dim of ["ciudad", "estado", "pais", "nicho"] as const) {
          const allowed = chiefScope[dim] ?? []
          const requested = requestedScope[dim] ?? []
          if (allowed.length && requested.length) {
            const unauthorized = requested.filter((v) => !allowed.includes(v))
            if (unauthorized.length > 0) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `You don't have access to ${dim}: ${unauthorized.join(", ")}`,
              })
            }
          }
        }
      }

      const service = new PermissionService(ctx.db)
      return service.assign(input)
    }),

  revokeVendorScope: chiefProcedure
    .input(revokePermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN"

      if (!isAdmin) {
        if (input.resource !== "prospect") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Chiefs can only manage prospect permissions" })
        }
        const targetUser = await ctx.db.user.findUnique({ where: { id: input.userId }, select: { role: true } })
        if (!targetUser || targetUser.role !== "VENDOR") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Chiefs can only manage vendor permissions" })
        }
      }

      const service = new PermissionService(ctx.db)
      return service.revoke(input.userId, input.resource)
    }),

  myPermissions: protectedProcedure.query(async ({ ctx }) => {
    const service = new PermissionService(ctx.db)
    return service.getByUser(ctx.session.user.id)
  }),
})
