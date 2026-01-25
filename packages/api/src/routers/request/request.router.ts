import {
  createRequestSchema,
  updateRequestSchema,
  idRequestSchema,
  createSimpleRequestSchema,
} from "@package/validations"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc"
import { RequestService } from "./service/request.services"

const requestService = new RequestService()

export const requestRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await requestService.getAllRequests()
  }),
  getById: publicProcedure
    .input(idRequestSchema)
    .query(async ({ input }: { input: { id: string } }) => {
      return await requestService.getRequestById(input.id)
    }),
  create: publicProcedure
    .input(createRequestSchema)
    .mutation(async ({ input } : { input: any }) => {
      return await requestService.createRequest({ input })
    }),
  // Endpoint simplificado para formulario de contacto
  createSimple: publicProcedure
    .input(createSimpleRequestSchema)
    .mutation(async ({ input }) => {
      return await requestService.createSimpleRequest(input)
    }),
  update: protectedProcedure
    .input(updateRequestSchema)
    .mutation(async ({ input } : { input: any }) => {
      return await requestService.updateRequest(input)
    }),
  delete: protectedProcedure
    .input(idRequestSchema)
    .mutation(async ({ input } : { input: { id: string } }) => {
      return await requestService.deleteRequest(input.id)
    }),
})
