import { type Bill } from "@package/db"
import { type z } from "zod"
import {
  type CreateBillSchema,
  type UpdateBillSchema,
} from "@package/validations"

export interface IBillService {
  createBill(
    input: z.infer<typeof CreateBillSchema> & { userId: string }
  ): Promise<Bill>
  getBills(userId: string): Promise<Bill[]>
  getBill(id: string, userId: string): Promise<Bill | null>
  updateBill(
    input: z.infer<typeof UpdateBillSchema>,
    userId: string
  ): Promise<Bill>
  deleteBill(id: string, userId: string): Promise<Bill>
}
