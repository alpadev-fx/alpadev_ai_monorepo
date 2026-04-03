import type { CreateRequestArgs } from "./request.services.types"
import type { UpdateRequestInput } from "../repository/request.repository.types"
import type { CreateSimpleRequestInput } from "@package/validations"

import { Prisma, type User } from "@package/db"
import { TRPCError } from "@trpc/server"
import { RequestRepository } from "../repository/request.repository"
import { db } from "@package/db"

export class RequestService {
  private repository: RequestRepository

  private static readonly DATE_NORMALIZATION_COOLDOWN_MS = 60_000
  private static lastUserDateNormalization = 0
  private static userDateNormalizationInFlight: Promise<void> | null = null

  constructor() {
    this.repository = new RequestRepository()
  }

  public async getAllRequests() {
    return await this.repository.getAll()
  }

  public async getRequestById(id: string) {
    return await this.repository.getById(id)
  }

  public async createRequest(args: CreateRequestArgs) {
    return await this.repository.create(args.input)
  }

  // Método simplificado para crear usuario y request desde formulario
  public async createSimpleRequest(input: CreateSimpleRequestInput) {
    console.log("[RequestService] createSimpleRequest started with input:", {
      name: input.name,
      email: input.email,
      phone: input.phone,
      type: input.type,
      priority: input.priority,
      title: input.title?.substring(0, 50) + "...",
    })

    try {
      // Buscar o crear usuario
      console.log("[RequestService] Searching for existing user...")
      let user = await this.findExistingUser(input)

      if (!user) {
        console.log("[RequestService] User not found, creating new user...")
        // Crear nuevo usuario
        try {
          user = await db.user.create({
            data: {
              name: input.name,
              email: input.email,
              phone: input.phone,
              role: "GUEST",
            },
          })
          console.log("[RequestService] User created successfully:", user.id)
        } catch (createError) {
          console.error("[RequestService] User creation failed:", createError)

          if (
            createError instanceof Prisma.PrismaClientKnownRequestError &&
            createError.code === "P2031"
          ) {
            console.log(
              "[RequestService] Trying raw MongoDB insert for user..."
            )
            const rawInsertResult = (await db.$runCommandRaw({
              insert: "User",
              documents: [
                {
                  name: input.name,
                  email: input.email,
                  phone: input.phone,
                  role: "GUEST",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            })) as { insertedIds?: Record<string, unknown> }

            const insertedUserId = this.resolveInsertedId(rawInsertResult)

            if (insertedUserId) {
              user = await db.user.findUnique({
                where: { id: insertedUserId },
              })
            }

            if (!user) {
              user = await db.user.findFirst({
                where: {
                  OR: [{ email: input.email }, { phone: input.phone }],
                },
              })
            }
            console.log(
              "[RequestService] User created via raw insert:",
              user?.id
            )
          } else {
            throw createError
          }
        }
      } else {
        console.log("[RequestService] Found existing user:", user.id)
      }

      if (!user) {
        console.error(
          "[RequestService] Unable to resolve user after creation attempts"
        )
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to resolve user after creation",
        })
      }

      // Crear request asociado al usuario
      console.log("[RequestService] Creating request for user:", user.id)
      try {
        const request = await db.request.create({
          data: {
            userId: user.id,
            type: input.type,
            priority: input.priority,
            title: input.title,
            description: input.description,
          },
          include: {
            user: true,
          },
        })
        console.log(
          "[RequestService] Request created successfully:",
          request.id
        )
        return request
      } catch (requestError) {
        console.error("[RequestService] Request creation failed:", requestError)

        if (
          requestError instanceof Prisma.PrismaClientKnownRequestError &&
          requestError.code === "P2031"
        ) {
          console.log(
            "[RequestService] Trying raw MongoDB insert for request..."
          )
          const rawInsertResult = (await db.$runCommandRaw({
            insert: "Request",
            documents: [
              {
                userId: user.id,
                type: input.type,
                priority: input.priority,
                title: input.title,
                description: input.description,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          })) as { insertedIds?: Record<string, unknown> }

          let persistedRequest = null
          const insertedRequestId = this.resolveInsertedId(rawInsertResult)

          if (insertedRequestId) {
            persistedRequest = await db.request.findUnique({
              where: { id: insertedRequestId },
              include: {
                user: true,
              },
            })
          }

          if (!persistedRequest) {
            persistedRequest = await db.request.findFirst({
              where: {
                userId: user.id,
                title: input.title,
                description: input.description,
              },
              include: {
                user: true,
              },
            })
          }

          if (!persistedRequest) {
            console.error(
              "[RequestService] Unable to locate request after raw creation"
            )
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Unable to locate request after creation",
            })
          }

          console.log(
            "[RequestService] Request created via raw insert:",
            persistedRequest.id
          )
          return persistedRequest
        }

        throw requestError
      }
    } catch (error) {
      console.error("[RequestService] createSimpleRequest failed with error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : typeof error,
        input: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          type: input.type,
          priority: input.priority,
        },
      })

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? `Database operation failed: ${error.message}`
            : "Failed to create request",
      })
    }
  }

  private async findExistingUser(input: CreateSimpleRequestInput): Promise<User | null> {
    await this.ensureUserDateFieldsNormalized()

    const where = this.buildUserWhereClause(input)
    if (!where) {
      return null
    }

    try {
      return await db.user.findFirst({ where })
    } catch (error) {
      if (!this.isInconsistentDateError(error)) {
        throw error
      }

      console.warn(
        "[RequestService] Inconsistent date error detected during user lookup. Running targeted normalization...",
        {
          email: input.email,
          phone: input.phone,
        }
      )

      await this.ensureUserDateFieldsNormalized(true)

      const contactFilter = this.buildUserContactFilter(input)
      if (contactFilter) {
        const normalizedUsers = await this.normalizeCollectionDateFields(
          "User",
          ["createdAt", "updatedAt"],
          contactFilter
        )

        console.log(
          "[RequestService] Normalized user documents for contact filter",
          {
            normalizedUsers,
            email: input.email,
            phone: input.phone,
          }
        )
      }

      try {
        return await db.user.findFirst({ where })
      } catch (retryError) {
        if (!this.isInconsistentDateError(retryError)) {
          throw retryError
        }

        console.error(
          "[RequestService] User lookup still failing after normalization attempts",
          {
            email: input.email,
            phone: input.phone,
          }
        )

        throw retryError
      }
    }
  }

  private buildUserWhereClause(input: CreateSimpleRequestInput) {
    const orClauses: Array<Record<string, string>> = []

    if (input.email) {
      orClauses.push({ email: input.email })
    }

    if (input.phone) {
      orClauses.push({ phone: input.phone })
    }

    if (!orClauses.length) {
      return null
    }

    return orClauses.length === 1 ? orClauses[0] : { OR: orClauses }
  }

  private buildUserContactFilter(input: CreateSimpleRequestInput) {
    const orClauses: Array<Record<string, string>> = []

    if (input.email) {
      orClauses.push({ email: input.email })
    }

    if (input.phone) {
      orClauses.push({ phone: input.phone })
    }

    if (!orClauses.length) {
      return null
    }

    return orClauses.length === 1 ? orClauses[0] : { $or: orClauses }
  }

  private buildDateNormalizationFilter(
    dateFields: string[],
    extraFilter?: Record<string, unknown>
  ) {
    const candidateTypes = ["string", "double", "int", "long", "decimal"]
    const baseConditions = dateFields.flatMap((field) =>
      candidateTypes.map((type) => ({ [field]: { $type: type } }))
    )

    if (!baseConditions.length) {
      return extraFilter ?? {}
    }

    const baseFilter =
      baseConditions.length === 1 ? baseConditions[0] : { $or: baseConditions }

    if (!extraFilter || !Object.keys(extraFilter).length) {
      return baseFilter
    }

    return { $and: [extraFilter, baseFilter] }
  }

  private buildDateConversionStage(dateFields: string[]) {
    const stage: Record<string, unknown> = {}

    for (const field of dateFields) {
      const fieldPath = `$${field}`
      stage[field] = {
        $cond: [
          { $eq: [{ $type: fieldPath }, "date"] },
          fieldPath,
          {
            $convert: {
              input: fieldPath,
              to: "date",
              onError: "$$NOW",
              onNull: "$$NOW",
            },
          },
        ],
      }
    }

    return { $set: stage }
  }

  private resolveInsertedId(result: { insertedIds?: Record<string, unknown> }) {
    const { insertedIds } = result ?? {}
    if (!insertedIds) {
      return null
    }

    const firstInserted = Object.values(insertedIds)[0]
    if (!firstInserted) {
      return null
    }

    if (typeof firstInserted === "string") {
      return firstInserted
    }

    if (
      typeof firstInserted === "object" &&
      firstInserted !== null &&
      "$oid" in firstInserted &&
      typeof (firstInserted as { $oid: unknown }).$oid === "string"
    ) {
      return (firstInserted as { $oid: string }).$oid
    }

    if (typeof (firstInserted as { toString?: () => string }).toString === "function") {
      return (firstInserted as { toString: () => string }).toString()
    }

    return null
  }

  private async ensureUserDateFieldsNormalized(force = false): Promise<void> {
    if (force && RequestService.userDateNormalizationInFlight) {
      try {
        await RequestService.userDateNormalizationInFlight
      } catch {
        // Ignore previous normalization errors; we'll attempt again below.
      }
    }

    if (force) {
      RequestService.lastUserDateNormalization = 0
    }

    if (
      !force &&
      !RequestService.userDateNormalizationInFlight &&
      Date.now() - RequestService.lastUserDateNormalization <
        RequestService.DATE_NORMALIZATION_COOLDOWN_MS
    ) {
      return
    }

    if (!RequestService.userDateNormalizationInFlight) {
      RequestService.userDateNormalizationInFlight = (async () => {
        try {
          const normalizedUsers = await this.normalizeCollectionDateFields(
            "User",
            ["createdAt", "updatedAt"]
          )

          if (normalizedUsers > 0) {
            console.log(
              "[RequestService] Normalized user documents during global scan",
              { normalizedUsers }
            )
          }
        } catch (normalizationError) {
          console.error("[RequestService] Failed to normalize user date fields", {
            error:
              normalizationError instanceof Error
                ? normalizationError.message
                : String(normalizationError),
          })
        } finally {
          RequestService.lastUserDateNormalization = Date.now()
          RequestService.userDateNormalizationInFlight = null
        }
      })()
    }

    try {
      await RequestService.userDateNormalizationInFlight
    } catch {
      // Error already logged above. The Prisma call will still throw if the issue persists.
    }
  }

  private isInconsistentDateError(error: unknown): boolean {
    return (
      error instanceof Error &&
      error.message.includes("Inconsistent column data")
    )
  }

  private async normalizeCollectionDateFields(
    collection: string,
    dateFields: string[],
    extraFilter?: Record<string, unknown>
  ): Promise<number> {
    const filter = this.buildDateNormalizationFilter(dateFields, extraFilter)
    const updatePipeline = [this.buildDateConversionStage(dateFields)]

    const commandResult = (await db.$runCommandRaw({
      update: collection,
      updates: [
        {
          q: filter as any,
          u: updatePipeline as any,
          multi: true,
        },
      ],
    })) as {
      n?: number
      nModified?: number
      ok?: number
    }

    if (commandResult?.ok !== 1) {
      console.warn("[RequestService] Date normalization command returned non-ok status", {
        collection,
        ok: commandResult?.ok,
        n: commandResult?.n,
        nModified: commandResult?.nModified,
      })
    }

    const modifiedCount =
      typeof commandResult?.nModified === "number"
        ? commandResult.nModified
        : commandResult?.n ?? 0

    return modifiedCount
  }

  public async updateRequest(data: UpdateRequestInput) {
    return await this.repository.update(data)
  }

  public async deleteRequest(id: string) {
    return await this.repository.delete(id)
  }
}
