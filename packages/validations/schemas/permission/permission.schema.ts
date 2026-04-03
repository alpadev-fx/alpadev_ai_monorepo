import { z } from "zod"

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")

const RESOURCES = ["prospect", "invoice", "booking", "bill", "transaction"] as const
const ACTIONS = ["read", "write", "delete"] as const

export const resourceSchema = z.enum(RESOURCES)
export const actionSchema = z.enum(ACTIONS)

export const permissionScopeSchema = z.object({
  ciudad: z.array(z.string()).optional(),
  estado: z.array(z.string()).optional(),
  pais: z.array(z.string()).optional(),
  nicho: z.array(z.string()).optional(),
}).optional()

export const assignPermissionSchema = z.object({
  userId: objectIdSchema,
  resource: resourceSchema,
  actions: z.array(actionSchema).min(1),
  scope: permissionScopeSchema,
})

export const updatePermissionSchema = z.object({
  id: objectIdSchema,
  actions: z.array(actionSchema).min(1).optional(),
  scope: permissionScopeSchema,
})

export const revokePermissionSchema = z.object({
  userId: objectIdSchema,
  resource: resourceSchema,
})

export const getPermissionsByUserSchema = z.object({
  userId: objectIdSchema,
})

export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>
export type RevokePermissionInput = z.infer<typeof revokePermissionSchema>
export type PermissionScope = z.infer<typeof permissionScopeSchema>
