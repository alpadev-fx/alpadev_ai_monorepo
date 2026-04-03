import { type Transaction } from "@package/db";
import { TRPCError } from "@trpc/server";
import type { TransactionRepository } from "../repository/transaction.repository";
import type { ITransactionService } from "./types";
import { type z } from "zod";
import { type CreateTransactionSchema, type UpdateTransactionSchema } from "@package/validations";

export class TransactionService implements ITransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  async createTransaction(
    input: z.infer<typeof CreateTransactionSchema> & { userId: string }
  ): Promise<Transaction> {
    return this.repository.create({
      amount: input.amount,
      date: input.date,
      category: input.category,
      status: input.status,
      description: input.description,
      userId: input.userId,
    });
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return this.repository.findManyByUserId(userId);
  }

  async getTransaction(id: string, userId: string): Promise<Transaction | null> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
    }
    if (transaction.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return transaction;
  }

  async updateTransaction(
    input: z.infer<typeof UpdateTransactionSchema>,
    userId: string
  ): Promise<Transaction> {
    const transaction = await this.repository.findById(input.id);
    if (!transaction) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
    }
    if (transaction.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.update(input.id, {
      amount: input.amount,
      date: input.date,
      category: input.category,
      status: input.status,
      description: input.description,
    });
  }

  async deleteTransaction(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
    }
    if (transaction.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.delete(id);
  }
}
