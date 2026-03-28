import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "../../trpc"
import { InfrastructureService, FREE_TIER, PRICING } from "./infrastructure.service"

const svc = new InfrastructureService()

export const infrastructureRouter = createTRPCRouter({
  overview: adminProcedure.query(() => svc.getOverview()),

  serviceConfig: adminProcedure.query(() => svc.getServiceConfig()),

  updateServiceConfig: adminProcedure
    .input(
      z.object({
        minInstances: z.number().min(0).max(10).optional(),
        maxInstances: z.number().min(1).max(10).optional(),
        cpu: z.enum(["0.5", "1", "2", "4"]).optional(),
        memory: z.enum(["256Mi", "512Mi", "1Gi", "2Gi", "4Gi"]).optional(),
        cpuIdle: z.boolean().optional(),
        startupCpuBoost: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await svc.updateServiceConfig(input)
      return { success: true }
    }),

  pricingInfo: adminProcedure.query(() => ({
    freeTier: FREE_TIER,
    pricing: PRICING,
  })),
})
