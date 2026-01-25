import { type Invoice } from "@package/db";
import { type z } from "zod";
import { type CreateInvoiceSchema, type UpdateInvoiceSchema } from "@package/validations";

export interface IInvoiceService {
  createInvoice(input: z.infer<typeof CreateInvoiceSchema> & { userId: string }): Promise<Invoice>;
  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  updateInvoice(input: z.infer<typeof UpdateInvoiceSchema>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<Invoice>;
}
