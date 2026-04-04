import { type PrismaClient, type Prisma } from "@package/db"

type JsonValue = Prisma.InputJsonValue | null

export class PermissionRepository {
  constructor(private db: PrismaClient) {}

  async findByUserId(userId: string) {
    return this.db.userPermission.findMany({ where: { userId } })
  }

  async findByUserAndResource(userId: string, resource: string) {
    return this.db.userPermission.findUnique({
      where: { userId_resource: { userId, resource } },
    })
  }

  async assign(data: { userId: string; resource: string; actions: string[]; scope?: JsonValue }) {
    return this.db.userPermission.upsert({
      where: { userId_resource: { userId: data.userId, resource: data.resource } },
      create: {
        userId: data.userId,
        resource: data.resource,
        actions: data.actions,
        scope: data.scope ?? null,
      },
      update: {
        actions: data.actions,
        scope: data.scope ?? null,
      },
    })
  }

  async update(id: string, data: { actions?: string[]; scope?: JsonValue }) {
    return this.db.userPermission.update({
      where: { id },
      data: {
        ...(data.actions && { actions: data.actions }),
        ...(data.scope !== undefined && { scope: data.scope ?? null }),
      },
    })
  }

  async revoke(userId: string, resource: string) {
    return this.db.userPermission.delete({
      where: { userId_resource: { userId, resource } },
    })
  }

  async findAll() {
    return this.db.userPermission.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    })
  }
}
