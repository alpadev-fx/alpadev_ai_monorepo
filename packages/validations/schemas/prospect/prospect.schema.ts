import { z } from "zod"
import { WebStatus } from "@package/db"

// --- ID Schema ---

export const idProspectSchema = z.object({
  id: z.string(),
})

export type IdProspectInput = z.infer<typeof idProspectSchema>

// --- Create Schema ---

export const createProspectSchema = z.object({
  nombre: z.string().min(1),
  displayName: z.string().nullable().optional(),
  nicho: z.string().min(1),
  industry: z.array(z.string()).default([]),
  ciudad: z.string().min(1),
  estado: z.string().min(1),
  pais: z.string().default("US"),
  countryFlag: z.string().nullable().optional(),
  direccion: z.string().min(1),
  sitioWeb: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  score: z.number().int().min(0).max(10).default(0),
  webStatus: z.nativeEnum(WebStatus).default("none"),
  serviciosRecomendados: z.array(z.string()).default([]),
  serviciosActivos: z.array(z.string()).default([]),
  opportunity: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  recSoftware: z.array(z.string()).default([]),
  recMarketing: z.array(z.string()).default([]),
  recFinanzas: z.array(z.string()).default([]),
  verified: z.boolean().default(false),
  verifiedAt: z.string().datetime().nullable().optional(),
  verificationNotes: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
})

export type CreateProspectInput = z.infer<typeof createProspectSchema>

// --- Update Schema ---

export const updateProspectSchema = createProspectSchema.partial().extend({
  id: z.string(),
})

export type UpdateProspectInput = z.infer<typeof updateProspectSchema>

// --- Filter Schema ---

export const prospectFilterSchema = z.object({
  search: z.string().optional(),
  nicho: z.array(z.string()).optional(),
  webStatus: z.array(z.nativeEnum(WebStatus)).optional(),
  scoreMin: z.number().int().min(0).max(10).optional(),
  scoreMax: z.number().int().min(0).max(10).optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
  verified: z.boolean().optional(),
  source: z.string().optional(),
  hasSocialMedia: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50000).default(25),
  sortBy: z
    .enum(["nombre", "nicho", "ciudad", "score", "webStatus", "createdAt", "email", "pais", "estado"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type ProspectFilterInput = z.infer<typeof prospectFilterSchema>

// --- Import Schema ---

export const importProspectsSchema = z.object({
  format: z.enum(["csv", "json"]),
  data: z.string(),
})

export type ImportProspectsInput = z.infer<typeof importProspectsSchema>

// --- Export Schema ---

export const exportProspectsSchema = z.object({
  format: z.enum(["csv", "json"]),
  search: z.string().optional(),
  nicho: z.array(z.string()).optional(),
  webStatus: z.array(z.nativeEnum(WebStatus)).optional(),
  scoreMin: z.number().int().min(0).max(10).optional(),
  scoreMax: z.number().int().min(0).max(10).optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
})

export type ExportProspectsInput = z.infer<typeof exportProspectsSchema>
