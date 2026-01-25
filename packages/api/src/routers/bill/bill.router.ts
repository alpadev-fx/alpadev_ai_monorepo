import { CreateBillSchema, UpdateBillSchema } from "@package/validations";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { db } from "@package/db";
import { BillRepository } from "./service/../repository/bill.repository";
import { BillService } from "./service/bill.service";

const billRepository = new BillRepository(db);
const billService = new BillService(billRepository);


export const billRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateBillSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return billService.createBill({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return billService.getBills(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }: { ctx: any, input: any }) => {
      return billService.getBill(input);
    }),

  update: protectedProcedure
    .input(UpdateBillSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return billService.updateBill(input);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return billService.deleteBill(input);
    }),
});
