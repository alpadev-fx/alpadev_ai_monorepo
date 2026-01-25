import { type PrismaClient, type BillStatus } from "@package/db";
import type { IBillRepository } from "./types";

export class BillRepository implements IBillRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    vendor: string;
    amount: number;
    dueDate: Date;
    status: BillStatus;
    userId: string;
  }) {
    return this.db.bill.create({
      data,
    });
  }

  async findById(id: string) {
    return this.db.bill.findUnique({
      where: { id },
    });
  }

  async findManyByUserId(userId: string) {
    return this.db.bill.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
  }

  async update(
    id: string,
    data: Partial<{
      vendor: string;
      amount: number;
      dueDate: Date;
      status: BillStatus;
    }>
  ) {
    return this.db.bill.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.db.bill.delete({
      where: { id },
    });
  }
}
