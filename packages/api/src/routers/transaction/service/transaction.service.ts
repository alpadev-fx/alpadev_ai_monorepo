import { type Transaction } from "@package/db";
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

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.repository.findById(id);
  }

  async updateTransaction(
    input: z.infer<typeof UpdateTransactionSchema>
  ): Promise<Transaction> {
    return this.repository.update(input.id, {
      amount: input.amount,
      date: input.date,
      category: input.category,
      status: input.status,
      description: input.description,
    });
  }

  async deleteTransaction(id: string): Promise<Transaction> {
    return this.repository.delete(id);
  }
}
