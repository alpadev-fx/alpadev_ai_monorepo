import { z } from "zod";
import { InvoiceStatus } from "@package/db";

export const CreateInvoiceSchema = z.object({
  client: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.date(),
  status: z.nativeEnum(InvoiceStatus).optional().default(InvoiceStatus.DRAFT),
  items: z.any().optional(), // Using any for Json type compatibility for now, can be refined later
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  id: z.string().min(1),
});
