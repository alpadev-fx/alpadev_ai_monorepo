import { db } from "@package/db"

import type { CreateRequestInput, UpdateRequestInput } from "./request.repository.types"

export class RequestRepository {
  public async getAll() {
    return await db.request.findMany({
      include: {
        user: true,
        // property: true, // TODO: Add property model to schema
      },
    })  
  }

  public async getById(id: string) {
    return await db.request.findUnique({
      where: { id },
      include: {
        user: true,
        // property: true, // TODO: Add property model to schema
      },
    })
  }

  public async create(data: CreateRequestInput) {
    return await db.request.create({
      data,
      include: {
        user: true,
        // property: true, // TODO: Add property model to schema
      },
    })
  }

  public async update(data: UpdateRequestInput) {
    return await db.request.update({
      where: { id: data.id },
      data,
      include: {
        user: true,
        // property: true, // TODO: Add property model to schema
      },
    })
  }

  public async delete(id: string) {
    return await db.request.delete({
      where: { id },
      include: {
        user: true,
        // property: true, // TODO: Add property model to schema
      },
    })
  }
}