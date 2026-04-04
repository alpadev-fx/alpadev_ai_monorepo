import { CreateBillSchema, UpdateBillSchema } from "@package/validations";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { db } from "@package/db";
import { BillRepository } from "./service/../repository/bill.repository";
import { BillService } from "./service/bill.service";

const billRepository = new BillRepository(db);
const billService = new BillService(billRepository, db);


export const billRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateBillSchema)
    .mutation(async ({ ctx, input }) => {
      return billService.createBill({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return billService.getBills(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return billService.getBill(input, ctx.session.user.id);
    }),

  update: protectedProcedure
    .input(UpdateBillSchema)
    .mutation(async ({ ctx, input }) => {
      return billService.updateBill(input, ctx.session.user.id);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return billService.deleteBill(input, ctx.session.user.id);
    }),
});
