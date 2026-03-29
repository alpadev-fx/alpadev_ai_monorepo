import { z } from "zod"
import {
  updateServiceConfigSchema,
  createBudgetSchema,
  createAlertPolicySchema,
  analyzeFailureSchema,
} from "@package/validations"
import { createTRPCRouter, adminProcedure } from "../../trpc"
import { InfrastructureService, FREE_TIER, PRICING } from "./infrastructure.service"

const svc = new InfrastructureService()

export const infrastructureRouter = createTRPCRouter({
  // ── Metrics ────────────────────────────────────────────────
  overview: adminProcedure.query(() => svc.getOverview()),
  pricingInfo: adminProcedure.query(() => ({ freeTier: FREE_TIER, pricing: PRICING })),

  // ── Scaling ────────────────────────────────────────────────
  serviceConfig: adminProcedure.query(() => svc.getServiceConfig()),
  updateServiceConfig: adminProcedure
    .input(updateServiceConfigSchema)
    .mutation(async ({ input }) => {
      await svc.updateServiceConfig(input)
      return { success: true }
    }),

  // ── Budgets ────────────────────────────────────────────────
  budgets: adminProcedure.query(() => svc.listBudgets()),
  createBudget: adminProcedure
    .input(createBudgetSchema)
    .mutation(async ({ input }) => {
      await svc.createBudget(input)
      return { success: true }
    }),
  deleteBudget: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      await svc.deleteBudget(input.name)
      return { success: true }
    }),

  // ── Alert Policies ─────────────────────────────────────────
  alertPolicies: adminProcedure.query(() => svc.listAlertPolicies()),
  createAlertPolicy: adminProcedure
    .input(createAlertPolicySchema)
    .mutation(async ({ input }) => {
      await svc.createAlertPolicy(input)
      return { success: true }
    }),
  deleteAlertPolicy: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      await svc.deleteAlertPolicy(input.name)
      return { success: true }
    }),

  // ── Error Logs + AI Analysis ───────────────────────────────
  recentErrors: adminProcedure
    .input(z.object({ hours: z.number().min(1).max(168).default(24) }).optional())
    .query(({ input }) => svc.getRecentErrors(input?.hours)),
  analyzeFailure: adminProcedure
    .input(analyzeFailureSchema)
    .mutation(({ input }) => svc.analyzeFailure(input.errorMessages)),
})
