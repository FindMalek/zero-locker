import { SecretEntity } from "@/entities/secrets"
import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  createSecretInputSchema,
  deleteSecretInputSchema,
  getSecretInputSchema,
  listSecretsInputSchema,
  listSecretsOutputSchema,
  secretSimpleOutputSchema,
  updateSecretInputSchema,
  type ListSecretsOutput,
  type SecretSimpleOutput,
} from "@/schemas/secrets"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"

import { createEncryptedData } from "@/lib/utils/encryption-helpers"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// Get secret by ID
export const getSecret = authProcedure
  .input(getSecretInputSchema)
  .output(secretSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<SecretSimpleOutput> => {
    const secret = await database.secret.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!secret) {
      throw new ORPCError("NOT_FOUND")
    }

    // Update last viewed timestamp
    await database.secret.update({
      where: { id: input.id },
      data: { lastViewed: new Date() },
    })

    return SecretEntity.getSimpleRo(secret)
  })

// List secrets with pagination
export const listSecrets = authProcedure
  .input(listSecretsInputSchema)
  .output(listSecretsOutputSchema)
  .handler(async ({ input, context }): Promise<ListSecretsOutput> => {
    const { page, limit, search, containerId } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { note: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [secrets, total] = await Promise.all([
      database.secret.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.secret.count({ where }),
    ])

    return {
      secrets: secrets.map((secret) => SecretEntity.getSimpleRo(secret)),
      total,
      hasMore: skip + secrets.length < total,
      page,
      limit,
    }
  })

// Create secret
export const createSecret = authProcedure
  .input(createSecretInputSchema)
  .output(secretSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<SecretSimpleOutput> => {
    const secret = await database.$transaction(async (tx) => {
      const valueEncryptionResult = await createEncryptedData(
        {
          encryptedValue: input.valueEncryption.encryptedValue,
          encryptionKey: input.valueEncryption.encryptionKey,
          iv: input.valueEncryption.iv,
        },
        tx
      )

      if (
        !valueEncryptionResult.success ||
        !valueEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      return await tx.secret.create({
        data: {
          name: input.name,
          note: input.note,
          valueEncryptionId: valueEncryptionResult.encryptedData.id,
          containerId: input.containerId,
          userId: context.user.id,
        },
      })
    })

    return SecretEntity.getSimpleRo(secret)
  })

// Update secret
export const updateSecret = authProcedure
  .input(updateSecretInputSchema)
  .output(secretSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<SecretSimpleOutput> => {
    const { id, ...updateData } = input

    // Verify secret ownership
    const existingSecret = await database.secret.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
    })

    if (!existingSecret) {
      throw new ORPCError("NOT_FOUND")
    }

    // Process the update data
    const updatePayload: Prisma.SecretUpdateInput = {}

    if (updateData.name !== undefined) updatePayload.name = updateData.name
    if (updateData.note !== undefined) updatePayload.note = updateData.note
    if (updateData.containerId) {
      updatePayload.container = { connect: { id: updateData.containerId } }
    }

    // Handle value encryption updates if provided
    if (updateData.valueEncryption) {
      const valueEncryptionResult = await createEncryptedData({
        encryptedValue: updateData.valueEncryption.encryptedValue,
        encryptionKey: updateData.valueEncryption.encryptionKey,
        iv: updateData.valueEncryption.iv,
      })

      if (
        !valueEncryptionResult.success ||
        !valueEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      updatePayload.valueEncryption = {
        connect: { id: valueEncryptionResult.encryptedData.id },
      }
    }

    const updatedSecret = await database.secret.update({
      where: { id },
      data: updatePayload,
    })

    return SecretEntity.getSimpleRo(updatedSecret)
  })

// Delete secret
export const deleteSecret = authProcedure
  .input(deleteSecretInputSchema)
  .output(secretSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<SecretSimpleOutput> => {
    // Verify secret ownership
    const existingSecret = await database.secret.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!existingSecret) {
      throw new ORPCError("NOT_FOUND")
    }

    const deletedSecret = await database.secret.delete({
      where: { id: input.id },
    })

    return SecretEntity.getSimpleRo(deletedSecret)
  })

// Export the secret router
export const secretRouter = {
  get: getSecret,
  list: listSecrets,
  create: createSecret,
  update: updateSecret,
  delete: deleteSecret,
}
