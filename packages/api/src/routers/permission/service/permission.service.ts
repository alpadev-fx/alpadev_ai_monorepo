import { TRPCError } from "@trpc/server"
import { type PrismaClient } from "@package/db"
import { PermissionRepository } from "../repository/permission.repository"

export class PermissionService {
  private repo: PermissionRepository

  constructor(private db: PrismaClient) {
    this.repo = new PermissionRepository(db)
  }

  async assign(input: { userId: string; resource: string; actions: string[]; scope?: Record<string, string[]> | null }) {
    const user = await this.db.user.findUnique({ where: { id: input.userId } })
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    }
    return this.repo.assign(input)
  }

  async update(input: { id: string; actions?: string[]; scope?: Record<string, string[]> | null }) {
    return this.repo.update(input.id, { actions: input.actions, scope: input.scope })
  }

  async getByUser(userId: string) {
    return this.repo.findByUserId(userId)
  }

  async getAll() {
    return this.repo.findAll()
  }

  async revoke(userId: string, resource: string) {
    const existing = await this.repo.findByUserAndResource(userId, resource)
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Permission not found" })
    }
    return this.repo.revoke(userId, resource)
  }

  async checkPermission(userId: string, resource: string, action: string) {
    const permission = await this.repo.findByUserAndResource(userId, resource)
    if (!permission) return null
    if (!permission.actions.includes(action)) return null
    return permission
  }
}
