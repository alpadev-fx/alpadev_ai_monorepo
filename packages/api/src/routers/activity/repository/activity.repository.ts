import { type PrismaClient, type Prisma } from "@package/db"

export class ActivityRepository {
  constructor(private db: PrismaClient) {}

  async log(entry: {
    userId: string
    action: string
    resource: string
    resourceId?: string | null
    method: string
    details?: Prisma.InputJsonValue | null
    ipAddress?: string | null
    userAgent?: string | null
    success?: boolean
    duration?: number | null
  }) {
    return this.db.activityLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        method: entry.method,
        details: entry.details ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        success: entry.success ?? true,
        duration: entry.duration ?? null,
      },
    })
  }

  async findByUser(userId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize
    const [items, total] = await Promise.all([
      this.db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.db.activityLog.count({ where: { userId } }),
    ])
    return {
      items,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    }
  }

  async findAll(filters: {
    resource?: string
    action?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    page: number
    pageSize: number
  }) {
    const where: Prisma.ActivityLogWhereInput = {}
    if (filters.resource) where.resource = filters.resource
    if (filters.action) where.action = { contains: filters.action }
    if (filters.userId) where.userId = filters.userId
    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      }
    }

    const skip = (filters.page - 1) * filters.pageSize
    const [items, total] = await Promise.all([
      this.db.activityLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
      }),
      this.db.activityLog.count({ where }),
    ])
    return {
      items,
      pagination: { total, page: filters.page, pageSize: filters.pageSize, totalPages: Math.ceil(total / filters.pageSize) },
    }
  }

  async vendorStats(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalActions, actionsToday, lastActivity, topResources] = await Promise.all([
      this.db.activityLog.count({ where: { userId } }),
      this.db.activityLog.count({ where: { userId, createdAt: { gte: today } } }),
      this.db.activityLog.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
      this.db.activityLog.groupBy({
        by: ["resource"],
        where: { userId },
        _count: true,
        orderBy: { _count: { resource: "desc" } },
        take: 5,
      }),
    ])

    return {
      totalActions,
      actionsToday,
      lastActive: lastActivity?.createdAt ?? null,
      topResources: topResources.map((r) => ({ resource: r.resource, count: r._count })),
    }
  }

  async dashboardStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [actionsToday, activeVendorsToday, topResources, topVendors] = await Promise.all([
      this.db.activityLog.count({ where: { createdAt: { gte: today } } }),
      this.db.activityLog.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: today } },
        _count: true,
      }),
      this.db.activityLog.groupBy({
        by: ["resource"],
        where: { createdAt: { gte: today } },
        _count: true,
        orderBy: { _count: { resource: "desc" } },
        take: 5,
      }),
      this.db.activityLog.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: today } },
        _count: true,
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      }),
    ])

    // Resolve vendor names
    const vendorIds = topVendors.map((v) => v.userId)
    const vendorUsers = vendorIds.length > 0
      ? await this.db.user.findMany({
          where: { id: { in: vendorIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const userMap = new Map(vendorUsers.map((u) => [u.id, u]))

    return {
      actionsToday,
      activeVendorsToday: activeVendorsToday.length,
      topResources: topResources.map((r) => ({ resource: r.resource, count: r._count })),
      topVendors: topVendors.map((v) => ({
        user: userMap.get(v.userId) ?? { id: v.userId, name: "Unknown", email: null },
        count: v._count,
      })),
    }
  }
}
