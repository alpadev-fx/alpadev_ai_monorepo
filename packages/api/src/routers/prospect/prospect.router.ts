import { createTRPCRouter, loggedProcedure as protectedProcedure } from "../../trpc"
import { ProspectService } from "./service/prospect.service"
import { PermissionService } from "../permission/service/permission.service"
import {
  prospectFilterSchema,
  idProspectSchema,
  createProspectSchema,
  updateProspectSchema,
  importProspectsSchema,
  exportProspectsSchema,
} from "@package/validations"
import { TRPCError } from "@trpc/server"
import { type PrismaClient } from "@package/db"

type PermissionScope = {
  ciudad?: string[]
  estado?: string[]
  pais?: string[]
  nicho?: string[]
}

async function getProspectScope(db: PrismaClient, userId: string, action: string) {
  const permService = new PermissionService(db)
  const permission = await permService.checkPermission(userId, "prospect", action)
  if (!permission) return null
  return (permission.scope as PermissionScope | null) ?? null
}

export const prospectRouter = createTRPCRouter({
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const isAdmin = ctx.session.user.role === "ADMIN"
    const db = ctx.db

    // Non-admin users: apply permission scope to all metric queries
    const scope = isAdmin ? null : await getProspectScope(db, userId, "read")
    const scopeFilter: Record<string, unknown> = { userId }
    if (scope?.ciudad?.length) scopeFilter.ciudad = { in: scope.ciudad }
    if (scope?.estado?.length) scopeFilter.estado = { in: scope.estado }
    if (scope?.pais?.length) scopeFilter.pais = { in: scope.pais }
    if (scope?.nicho?.length) scopeFilter.nicho = { in: scope.nicho }

    const where = scopeFilter

    const [total, avgScore, verified, withWebsite, withEmail, nicheGroups, scoreGroups, webStatusGroups, cityGroups, recent] =
      await Promise.all([
        db.prospect.count({ where }),
        db.prospect.aggregate({ where, _avg: { score: true } }),
        db.prospect.count({ where: { ...where, verified: true } }),
        db.prospect.count({ where: { ...where, sitioWeb: { not: null } } }),
        db.prospect.count({ where: { ...where, email: { not: null } } }),
        db.prospect.groupBy({ by: ["nicho"], where, _count: true, orderBy: { _count: { nicho: "desc" } }, take: 10 }),
        db.prospect.groupBy({ by: ["score"], where, _count: true, orderBy: { score: "asc" } }),
        db.prospect.groupBy({ by: ["webStatus"], where, _count: true }),
        db.prospect.groupBy({ by: ["ciudad"], where, _count: true, orderBy: { _count: { ciudad: "desc" } }, take: 8 }),
        db.prospect.findMany({ where, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, nombre: true, nicho: true, score: true } }),
      ])

    return {
      total,
      avgScore: avgScore._avg.score ?? 0,
      verified,
      withWebsite,
      withEmail,
      topNiches: nicheGroups.map((g) => ({ nicho: g.nicho, count: g._count })),
      scoreDistribution: scoreGroups.map((g) => ({ score: g.score, count: g._count })),
      webStatus: webStatusGroups.map((g) => ({ status: g.webStatus, count: g._count })),
      topCities: cityGroups.map((g) => ({ city: g.ciudad, count: g._count })),
      recent,
    }
  }),

  getAll: protectedProcedure
    .input(prospectFilterSchema)
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN"
      const scope = isAdmin ? null : await getProspectScope(ctx.db, ctx.session.user.id, "read")

      // Merge permission scope into filter — scope narrows, never widens
      const mergedInput = { ...input }
      if (scope?.ciudad?.length) mergedInput.ciudad = scope.ciudad[0]
      if (scope?.estado?.length) mergedInput.estado = scope.estado[0]
      if (scope?.pais?.length) mergedInput.pais = scope.pais[0]
      if (scope?.nicho?.length) mergedInput.nicho = scope.nicho

      const service = new ProspectService(ctx.db)
      return service.getAll(mergedInput, ctx.session.user.id)
    }),

  getById: protectedProcedure
    .input(idProspectSchema)
    .query(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      const prospect = await service.getById(input.id, ctx.session.user.id)

      // Non-admin: verify prospect matches permission scope
      if (ctx.session.user.role !== "ADMIN") {
        const scope = await getProspectScope(ctx.db, ctx.session.user.id, "read")
        if (scope) {
          if (scope.ciudad?.length && !scope.ciudad.includes(prospect.ciudad)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Access denied by permission scope" })
          }
          if (scope.estado?.length && !scope.estado.includes(prospect.estado)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Access denied by permission scope" })
          }
        }
      }

      return prospect
    }),

  create: protectedProcedure
    .input(createProspectSchema)
    .mutation(async ({ ctx, input }) => {
      // Non-admin: check write permission
      if (ctx.session.user.role !== "ADMIN") {
        const permService = new PermissionService(ctx.db)
        const perm = await permService.checkPermission(ctx.session.user.id, "prospect", "write")
        if (!perm) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No write permission for prospects" })
        }
      }
      const service = new ProspectService(ctx.db)
      return service.create(input, ctx.session.user.id)
    }),

  update: protectedProcedure
    .input(updateProspectSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        const permService = new PermissionService(ctx.db)
        const perm = await permService.checkPermission(ctx.session.user.id, "prospect", "write")
        if (!perm) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No write permission for prospects" })
        }
      }
      const service = new ProspectService(ctx.db)
      const { id, ...data } = input
      return service.update(id, data, ctx.session.user.id)
    }),

  delete: protectedProcedure
    .input(idProspectSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        const permService = new PermissionService(ctx.db)
        const perm = await permService.checkPermission(ctx.session.user.id, "prospect", "delete")
        if (!perm) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No delete permission for prospects" })
        }
      }
      const service = new ProspectService(ctx.db)
      return service.delete(input.id, ctx.session.user.id)
    }),

  import: protectedProcedure
    .input(importProspectsSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        const permService = new PermissionService(ctx.db)
        const perm = await permService.checkPermission(ctx.session.user.id, "prospect", "write")
        if (!perm) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No write permission for prospects" })
        }
      }
      const service = new ProspectService(ctx.db)
      return service.importProspects(input, ctx.session.user.id)
    }),

  export: protectedProcedure
    .input(exportProspectsSchema)
    .query(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      return service.exportProspects(input, ctx.session.user.id)
    }),
})
