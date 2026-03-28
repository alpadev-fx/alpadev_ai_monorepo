import { createTRPCRouter, protectedProcedure } from "../../trpc"
import { ProspectService } from "./service/prospect.service"
import {
  prospectFilterSchema,
  idProspectSchema,
  createProspectSchema,
  updateProspectSchema,
  importProspectsSchema,
  exportProspectsSchema,
} from "@package/validations"

export const prospectRouter = createTRPCRouter({
  metrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const db = ctx.db

    const [total, avgScore, verified, withWebsite, withEmail, nicheGroups, scoreGroups, webStatusGroups, cityGroups, recent] =
      await Promise.all([
        db.prospect.count({ where: { userId } }),
        db.prospect.aggregate({ where: { userId }, _avg: { score: true } }),
        db.prospect.count({ where: { userId, verified: true } }),
        db.prospect.count({ where: { userId, sitioWeb: { not: null } } }),
        db.prospect.count({ where: { userId, email: { not: null } } }),
        db.prospect.groupBy({ by: ["nicho"], where: { userId }, _count: true, orderBy: { _count: { nicho: "desc" } }, take: 10 }),
        db.prospect.groupBy({ by: ["score"], where: { userId }, _count: true, orderBy: { score: "asc" } }),
        db.prospect.groupBy({ by: ["webStatus"], where: { userId }, _count: true }),
        db.prospect.groupBy({ by: ["ciudad"], where: { userId }, _count: true, orderBy: { _count: { ciudad: "desc" } }, take: 8 }),
        db.prospect.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, nombre: true, nicho: true, score: true } }),
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
      const service = new ProspectService(ctx.db)
      return service.getAll(input, ctx.session.user.id)
    }),

  getById: protectedProcedure
    .input(idProspectSchema)
    .query(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      return service.getById(input.id)
    }),

  create: protectedProcedure
    .input(createProspectSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      return service.create(input, ctx.session.user.id)
    }),

  update: protectedProcedure
    .input(updateProspectSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      const { id, ...data } = input
      return service.update(id, data)
    }),

  delete: protectedProcedure
    .input(idProspectSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new ProspectService(ctx.db)
      return service.delete(input.id)
    }),

  import: protectedProcedure
    .input(importProspectsSchema)
    .mutation(async ({ ctx, input }) => {
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
