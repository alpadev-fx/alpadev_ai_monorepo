import { z } from "zod"
import { createTRPCRouter, chiefProcedure } from "../../trpc"
import { ActivityService } from "./service/activity.service"

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")

const activityFiltersSchema = z.object({
  resource: z.string().optional(),
  action: z.string().optional(),
  userId: objectIdSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
})

const vendorStatsSchema = z.object({
  userId: objectIdSchema,
})

const byUserSchema = z.object({
  userId: objectIdSchema,
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
})

export const activityRouter = createTRPCRouter({
  getAll: chiefProcedure
    .input(activityFiltersSchema)
    .query(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db)
      return service.getAll(input)
    }),

  getByUser: chiefProcedure
    .input(byUserSchema)
    .query(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db)
      return service.getByUser(input.userId, input.page, input.pageSize)
    }),

  vendorStats: chiefProcedure
    .input(vendorStatsSchema)
    .query(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db)
      return service.vendorStats(input.userId)
    }),

  dashboard: chiefProcedure.query(async ({ ctx }) => {
    const service = new ActivityService(ctx.db)
    return service.dashboardStats()
  }),
})
