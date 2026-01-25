import { type PrismaClient, type TransactionStatus } from "@package/db";
import type { ITransactionRepository } from "./types";

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    amount: number;
    date: Date;
    category: string;
    status: TransactionStatus;
    description?: string | null;
    userId: string;
  }) {
    return this.db.transaction.create({
      data,
    });
  }

  async findById(id: string) {
    return this.db.transaction.findUnique({
      where: { id },
    });
  }

  async findManyByUserId(userId: string) {
    return this.db.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
  }

  async update(
    id: string,
    data: Partial<{
      amount: number;
      date: Date;
      category: string;
    status: TransactionStatus;
      description?: string | null;
    }>
  ) {
    return this.db.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.db.transaction.delete({
      where: { id },
    });
  }
}
