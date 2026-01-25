import { z } from "zod";
import { BillStatus } from "@package/db";

export const CreateBillSchema = z.object({
  vendor: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.date(),
  status: z.nativeEnum(BillStatus).optional().default(BillStatus.UNPAID),
});

export const UpdateBillSchema = CreateBillSchema.partial().extend({
  id: z.string().min(1),
});
