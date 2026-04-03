import type { RequestType, RequestStatus, RequestPriority } from "@package/db"

export interface CreateRequestInput {
  userId: string
  type: RequestType
  status: RequestStatus
  priority: RequestPriority
  title: string
  description: string
}

export type UpdateRequestInput = Partial<CreateRequestInput> & {
  id: string
}
