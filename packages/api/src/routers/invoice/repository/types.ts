import { type Invoice, type InvoiceStatus } from "@package/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;

export interface IInvoiceRepository {
  create(data: {
    client: string;
    amount: number;
    dueDate: Date;
    status: InvoiceStatus;
    items?: JsonValue;
    userId: string;
  }): Promise<Invoice>;

  findById(id: string): Promise<Invoice | null>;

  findManyByUserId(userId: string): Promise<Invoice[]>;

  update(
    id: string,
    data: Partial<{
      client: string;
      amount: number;
      dueDate: Date;
      status: InvoiceStatus;
      items?: JsonValue;
    }>
  ): Promise<Invoice>;

  delete(id: string): Promise<Invoice>;
}
