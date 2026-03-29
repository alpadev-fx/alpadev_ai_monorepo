import { z } from "zod"

export const updateServiceConfigSchema = z.object({
  minInstances: z.number().min(0).max(10).optional(),
  maxInstances: z.number().min(1).max(10).optional(),
  cpu: z.enum(["0.5", "1", "2", "4"]).optional(),
  memory: z.enum(["256Mi", "512Mi", "1Gi", "2Gi", "4Gi"]).optional(),
  cpuIdle: z.boolean().optional(),
  startupCpuBoost: z.boolean().optional(),
})

export type UpdateServiceConfigInput = z.infer<typeof updateServiceConfigSchema>

export const createBudgetSchema = z.object({
  displayName: z.string().min(1).max(100),
  amount: z.number().min(1),
  currency: z.enum(["USD", "COP"]),
  thresholds: z.array(z.number().min(1).max(100)).min(1).max(5),
  notificationEmail: z.string().email().optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>

export const createAlertPolicySchema = z.object({
  type: z.enum(["error_rate", "latency", "instance_crash", "custom"]),
  displayName: z.string().min(1).max(100),
  threshold: z.number().min(0),
  notificationEmail: z.string().email(),
})

export type CreateAlertPolicyInput = z.infer<typeof createAlertPolicySchema>

export const analyzeFailureSchema = z.object({
  errorMessages: z.array(z.string()).min(1).max(10),
})

export type AnalyzeFailureInput = z.infer<typeof analyzeFailureSchema>
