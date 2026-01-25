import { CreateTransactionSchema, UpdateTransactionSchema } from "@package/validations";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { db } from "@package/db";
import { TransactionRepository } from "./service/../repository/transaction.repository";
import { TransactionService } from "./service/transaction.service";

const transactionRepository = new TransactionRepository(db);
const transactionService = new TransactionService(transactionRepository);


export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateTransactionSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return transactionService.createTransaction({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return transactionService.getTransactions(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }: { ctx: any, input: any }) => {
      return transactionService.getTransaction(input);
    }),

  update: protectedProcedure
    .input(UpdateTransactionSchema)
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return transactionService.updateTransaction(input);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
      return transactionService.deleteTransaction(input);
    }),
});
