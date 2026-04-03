import { type Bill, type PrismaClient } from "@package/db";
import { TRPCError } from "@trpc/server";
import type { BillRepository } from "../repository/bill.repository";
import type { IBillService } from "./types";
import { type z } from "zod";
import { type CreateBillSchema, type UpdateBillSchema } from "@package/validations";

export class BillService implements IBillService {
  constructor(
    private readonly repository: BillRepository,
    private readonly db?: PrismaClient,
  ) {}

  async createBill(
    input: z.infer<typeof CreateBillSchema> & { userId: string }
  ): Promise<Bill> {
    return this.repository.create({
      vendor: input.vendor,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      userId: input.userId,
    });
  }

  async getBills(userId: string): Promise<Bill[]> {
    return this.repository.findManyByUserId(userId);
  }

  async getBill(id: string, userId: string): Promise<Bill | null> {
    const bill = await this.repository.findById(id);
    if (!bill) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Bill not found" });
    }
    if (bill.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return bill;
  }

  async updateBill(input: z.infer<typeof UpdateBillSchema>, userId: string): Promise<Bill> {
    const bill = await this.repository.findById(input.id);
    if (!bill) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Bill not found" });
    }
    if (bill.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    const updated = await this.repository.update(input.id, {
      vendor: input.vendor,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
    });

    // Create transaction when bill is paid
    if (this.db && bill.status !== "PAID" && input.status === "PAID") {
      try {
        await this.db.transaction.create({
          data: {
            amount: updated.amount,
            date: new Date(),
            category: "bill_payment",
            status: "COMPLETED",
            description: `Payment for bill ${input.id}`,
            userId: updated.userId,
          },
        });
      } catch (err) {
        console.error("[Bill] Failed to create transaction for paid bill:", err);
      }
    }

    return updated;
  }

  async deleteBill(id: string, userId: string): Promise<Bill> {
    const bill = await this.repository.findById(id);
    if (!bill) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Bill not found" });
    }
    if (bill.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.delete(id);
  }
}
