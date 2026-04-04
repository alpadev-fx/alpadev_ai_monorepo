import { type Invoice, type PrismaClient } from "@package/db";
import { TRPCError } from "@trpc/server";
import type { InvoiceRepository } from "../repository/invoice.repository";
import type { IInvoiceService } from "./types";
import { type z } from "zod";
import { type CreateInvoiceSchema, type UpdateInvoiceSchema } from "@package/validations";

export class InvoiceService implements IInvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private readonly db?: PrismaClient,
  ) {}

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

  async getInvoice(id: string, userId: string): Promise<Invoice | null> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return invoice;
  }

  async updateInvoice(input: z.infer<typeof UpdateInvoiceSchema>, userId: string): Promise<Invoice> {
    const invoice = await this.repository.findById(input.id);
    if (!invoice) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    const updated = await this.repository.update(input.id, {
      client: input.client,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      items: input.items ?? undefined,
    });

    // Create transaction when invoice is paid
    if (this.db && invoice.status !== "PAID" && input.status === "PAID") {
      try {
        await this.db.transaction.create({
          data: {
            amount: updated.amount,
            date: new Date(),
            category: "invoice_payment",
            status: "COMPLETED",
            description: `Payment for invoice ${input.id}`,
            userId: updated.userId,
          },
        });
      } catch (err) {
        console.error("[Invoice] Failed to create transaction for paid invoice:", err);
      }
    }

    return updated;
  }

  async deleteInvoice(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
    }
    if (invoice.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.delete(id);
  }
}
