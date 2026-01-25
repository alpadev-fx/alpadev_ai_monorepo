import { z } from "zod";
import { TransactionStatus } from "@package/db";

export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  date: z.date(),
  category: z.string().min(1),
  status: z.nativeEnum(TransactionStatus).optional().default(TransactionStatus.PENDING),
  description: z.string().optional(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial().extend({
  id: z.string().min(1),
});
