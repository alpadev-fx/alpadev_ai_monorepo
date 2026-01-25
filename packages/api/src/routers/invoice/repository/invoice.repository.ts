import { type PrismaClient, type InvoiceStatus } from "@package/db";
import type { IInvoiceRepository } from "./types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;

export class InvoiceRepository implements IInvoiceRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: {
    client: string;
    amount: number;
    dueDate: Date;
    status: InvoiceStatus;
    items?: JsonValue;
    userId: string;
  }) {
    return this.db.invoice.create({
      data,
    });
  }

  async findById(id: string) {
    return this.db.invoice.findUnique({
      where: { id },
    });
  }

  async findManyByUserId(userId: string) {
    return this.db.invoice.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
  }

  async update(
    id: string,
    data: Partial<{
      client: string;
      amount: number;
      dueDate: Date;
      status: InvoiceStatus;
      items?: JsonValue;
    }>
  ) {
    return this.db.invoice.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.db.invoice.delete({
      where: { id },
    });
  }
}
