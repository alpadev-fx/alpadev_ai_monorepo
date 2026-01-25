import { type Bill } from "@package/db";
import type { BillRepository } from "../repository/bill.repository";
import type { IBillService } from "./types";
import { type z } from "zod";
import { type CreateBillSchema, type UpdateBillSchema } from "@package/validations";

export class BillService implements IBillService {
  constructor(private readonly repository: BillRepository) {}

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

  async getBill(id: string): Promise<Bill | null> {
    return this.repository.findById(id);
  }

  async updateBill(input: z.infer<typeof UpdateBillSchema>): Promise<Bill> {
    return this.repository.update(input.id, {
      vendor: input.vendor,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
    });
  }

  async deleteBill(id: string): Promise<Bill> {
    return this.repository.delete(id);
  }
}
