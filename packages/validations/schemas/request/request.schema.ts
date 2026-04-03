import { RequestType, RequestStatus, RequestPriority } from "@package/db"
import { z } from "zod"

export const idRequestSchema = z.object({
  id: z.string(),
})

export const createRequestSchema = z.object({
  userId: z.string(),
  type: z.nativeEnum(RequestType),
  status: z.nativeEnum(RequestStatus).default(RequestStatus.pending),
  priority: z.nativeEnum(RequestPriority).default(RequestPriority.medium),
  title: z.string(),
  description: z.string(),
})

// Schema simplificado para formulario de contacto
export const createSimpleRequestSchema = z.object({
  // Datos del usuario
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  // Datos del request
  type: z.nativeEnum(RequestType),
  priority: z.nativeEnum(RequestPriority).default(RequestPriority.medium),
  title: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
})

export type CreateSimpleRequestInput = z.infer<typeof createSimpleRequestSchema>

export const updateRequestSchema = z.object({
  id: z.string(),
})