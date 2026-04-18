import { type Transaction } from "@package/db"
import { type z } from "zod"
import {
  type CreateTransactionSchema,
  type UpdateTransactionSchema,
} from "@package/validations"

export interface ITransactionService {
  createTransaction(
    input: z.infer<typeof CreateTransactionSchema> & { userId: string }
  ): Promise<Transaction>
  getTransactions(userId: string): Promise<Transaction[]>
  getTransaction(id: string, userId: string): Promise<Transaction | null>
  updateTransaction(
    input: z.infer<typeof UpdateTransactionSchema>,
    userId: string
  ): Promise<Transaction>
  deleteTransaction(id: string, userId: string): Promise<Transaction>
}
