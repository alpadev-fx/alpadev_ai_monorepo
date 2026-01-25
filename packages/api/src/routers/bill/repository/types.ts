import { type Bill, type BillStatus } from "@package/db";

export interface IBillRepository {
  create(data: {
    vendor: string;
    amount: number;
    dueDate: Date;
    status: BillStatus;
    userId: string;
  }): Promise<Bill>;

  findById(id: string): Promise<Bill | null>;

  findManyByUserId(userId: string): Promise<Bill[]>;

  update(
    id: string,
    data: Partial<{
      vendor: string;
      amount: number;
      dueDate: Date;
      status: BillStatus;
    }>
  ): Promise<Bill>;

  delete(id: string): Promise<Bill>;
}
