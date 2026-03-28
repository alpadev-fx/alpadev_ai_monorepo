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
