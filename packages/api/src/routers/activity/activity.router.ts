import { z } from "zod"
import { createTRPCRouter, chiefProcedure } from "../../trpc"
import { type PrismaClient } from "@package/db"
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

  // List vendors (non-admin users) — accessible to CHIEF + ADMIN
  listVendors: chiefProcedure.query(async ({ ctx }) => {
    return (ctx.db as PrismaClient).user.findMany({
      where: { role: { in: ["VENDOR", "USER"] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    })
  }),

  // Vendor performance — lead pipeline + recruitment metrics
  vendorPerformance: chiefProcedure
    .input(z.object({ userId: objectIdSchema.optional() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db as PrismaClient
      const vendorFilter = input.userId ? { assignedTo: input.userId } : { assignedTo: { not: null } }

      // Lead pipeline by status
      const pipeline = await db.prospect.groupBy({
        by: ["leadStatus"],
        where: vendorFilter,
        _count: true,
      })

      // Per-vendor breakdown
      const vendors = await db.user.findMany({
        where: { role: "VENDOR" },
        select: { id: true, name: true, email: true },
      })

      const vendorMetrics = await Promise.all(
        vendors
          .filter((v) => !input.userId || v.id === input.userId)
          .map(async (vendor) => {
            const where = { assignedTo: vendor.id }
            const [total, byStatus, recentActivity, contacted, won, lost] = await Promise.all([
              db.prospect.count({ where }),
              db.prospect.groupBy({ by: ["leadStatus"], where, _count: true }),
              db.activityLog.findMany({
                where: { userId: vendor.id },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { action: true, resource: true, details: true, createdAt: true, duration: true, ipAddress: true, userAgent: true, success: true },
              }),
              db.prospect.count({ where: { ...where, leadStatus: "CONTACTED" } }),
              db.prospect.count({ where: { ...where, leadStatus: "WON" } }),
              db.prospect.count({ where: { ...where, leadStatus: "LOST" } }),
            ])

            const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : "0.0"

            return {
              vendor: { id: vendor.id, name: vendor.name, email: vendor.email },
              total,
              contacted,
              won,
              lost,
              conversionRate: parseFloat(conversionRate),
              pipeline: byStatus.map((s) => ({ status: s.leadStatus, count: s._count })),
              recentActivity,
            }
          })
      )

      // Activity trends (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const recentLogs = await db.activityLog.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...(input.userId ? { userId: input.userId } : {}),
        },
        select: { createdAt: true, userId: true },
      })

      // Group by day
      const dailyMap = new Map<string, number>()
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        dailyMap.set(d.toISOString().slice(0, 10), 0)
      }
      for (const log of recentLogs) {
        const day = log.createdAt.toISOString().slice(0, 10)
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
      }
      const dailyTrend = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        pipeline: pipeline.map((p) => ({ status: p.leadStatus, count: p._count })),
        vendors: vendorMetrics,
        dailyTrend,
      }
    }),
})
