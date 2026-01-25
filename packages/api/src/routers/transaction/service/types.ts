import { type Transaction } from "@package/db";
import { type z } from "zod";
import { type CreateTransactionSchema, type UpdateTransactionSchema } from "@package/validations";

export interface ITransactionService {
  createTransaction(input: z.infer<typeof CreateTransactionSchema> & { userId: string }): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  updateTransaction(input: z.infer<typeof UpdateTransactionSchema>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<Transaction>;
}
