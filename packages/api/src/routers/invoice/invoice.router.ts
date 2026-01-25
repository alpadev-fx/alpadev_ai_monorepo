import { CreateInvoiceSchema, UpdateInvoiceSchema } from "@package/validations";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { db } from "@package/db";
import { InvoiceRepository } from "./service/../repository/invoice.repository";
import { InvoiceService } from "./service/invoice.service";

const invoiceRepository = new InvoiceRepository(db);
const invoiceService = new InvoiceService(invoiceRepository);


export const invoiceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateInvoiceSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return invoiceService.createInvoice({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return invoiceService.getInvoices(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }: { ctx: any, input: any }) => {
      return invoiceService.getInvoice(input);
    }),

  update: protectedProcedure
    .input(UpdateInvoiceSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return invoiceService.updateInvoice(input);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return invoiceService.deleteInvoice(input);
    }),
});
