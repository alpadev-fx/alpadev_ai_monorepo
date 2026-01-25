import type { RequestType, RequestStatus, RequestPriority } from "@package/db"

export interface CreateRequestInput {
  userId: string
  propertyId: string
  type: RequestType
  status: RequestStatus
  priority: RequestPriority
  title: string
  description: string
  reservedStart: Date
  reservedEnd: Date
  createdAt: Date
  updatedAt: Date
}

export type UpdateRequestInput = Partial<CreateRequestInput> & {
  id: string
}   