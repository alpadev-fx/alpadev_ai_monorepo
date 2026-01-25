import { type Invoice } from "@package/db";
import type { InvoiceRepository } from "../repository/invoice.repository";
import type { IInvoiceService } from "./types";
import { type z } from "zod";
import { type CreateInvoiceSchema, type UpdateInvoiceSchema } from "@package/validations";

export class InvoiceService implements IInvoiceService {
  constructor(private readonly repository: InvoiceRepository) {}

  async createInvoice(
    input: z.infer<typeof CreateInvoiceSchema> & { userId: string }
  ): Promise<Invoice> {
    return this.repository.create({
      client: input.client,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      items: input.items ?? undefined,
      userId: input.userId,
    });
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return this.repository.findManyByUserId(userId);
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.repository.findById(id);
  }

  async updateInvoice(input: z.infer<typeof UpdateInvoiceSchema>): Promise<Invoice> {
    return this.repository.update(input.id, {
      client: input.client,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      items: input.items ?? undefined,
    });
  }

  async deleteInvoice(id: string): Promise<Invoice> {
    return this.repository.delete(id);
  }
}
