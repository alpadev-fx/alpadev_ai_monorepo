import { CreateInvoiceSchema, UpdateInvoiceSchema } from "@package/validations";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { db } from "@package/db";
import { InvoiceRepository } from "./service/../repository/invoice.repository";
import { InvoiceService } from "./service/invoice.service";

const invoiceRepository = new InvoiceRepository(db);
const invoiceService = new InvoiceService(invoiceRepository, db);


export const invoiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return invoiceService.createInvoice({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return invoiceService.getInvoices(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return invoiceService.getInvoice(input, ctx.session.user.id);
    }),

  update: protectedProcedure
    .input(UpdateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return invoiceService.updateInvoice(input, ctx.session.user.id);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return invoiceService.deleteInvoice(input, ctx.session.user.id);
    }),
});
