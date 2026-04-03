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
    .mutation(async ({ ctx, input }) => {
      return transactionService.createTransaction({
        ...input,
        userId: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return transactionService.getTransactions(ctx.session.user.id);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return transactionService.getTransaction(input, ctx.session.user.id);
    }),

  update: protectedProcedure
    .input(UpdateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      return transactionService.updateTransaction(input, ctx.session.user.id);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return transactionService.deleteTransaction(input, ctx.session.user.id);
    }),
});
