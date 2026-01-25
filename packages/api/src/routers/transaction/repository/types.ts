import { type Transaction, type TransactionStatus } from "@package/db";

export interface ITransactionRepository {
  create(data: {
    amount: number;
    date: Date;
    category: string;
    status: TransactionStatus;
    description?: string | null;
    userId: string;
  }): Promise<Transaction>;

  findById(id: string): Promise<Transaction | null>;

  findManyByUserId(userId: string): Promise<Transaction[]>;

  update(
    id: string,
    data: Partial<{
      amount: number;
      date: Date;
      category: string;
      status: TransactionStatus;
      description?: string | null;
    }>
  ): Promise<Transaction>;

  delete(id: string): Promise<Transaction>;
}
