import { type PrismaClient, type Prisma } from "@package/db"
import { ActivityRepository } from "../repository/activity.repository"

export class ActivityService {
  private repo: ActivityRepository

  constructor(db: PrismaClient) {
    this.repo = new ActivityRepository(db)
  }

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
    // Fire-and-forget — never block the caller
    return this.repo.log(entry).catch((err) => {
      console.error("[ActivityService] Failed to log activity:", err)
    })
  }

  async getByUser(userId: string, page = 1, pageSize = 20) {
    return this.repo.findByUser(userId, page, pageSize)
  }

  async getAll(filters: {
    resource?: string
    action?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    pageSize?: number
  }) {
    return this.repo.findAll({
      ...filters,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    })
  }

  async vendorStats(userId: string) {
    return this.repo.vendorStats(userId)
  }

  async dashboardStats() {
    return this.repo.dashboardStats()
  }
}
