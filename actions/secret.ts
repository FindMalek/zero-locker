"use server"

import { SecretEntity } from "@/entities/secret"
import { database } from "@/prisma/client"
import { Prisma } from "@prisma/client"
import { z } from "zod"

// Define Secret DTO matching the actual Secret model
const SecretDto = z.object({
  name: z.string(),
  value: z.string(),
  iv: z.string().optional(),
  encryptionKey: z.string().optional(),
  note: z.string().optional(),
  containerId: z.string().optional(),
})

export type SecretDtoType = z.infer<typeof SecretDto>
export type SecretSimpleRo = any // Replace with proper type from entity

import { verifySession } from "@/lib/auth/verify"
import { getOrReturnEmptyObject } from "@/lib/utils"

import { SecretMetadataDto } from "@/actions/secret-metadata"

/**
 * Create a new secret
 */
export async function createSecret(data: SecretDtoType): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = SecretDto.parse(data)

    // Secret data is ready to use directly

    try {
      // Create secret with Prisma - only using fields that exist in Secret model
      const secret = await database.secret.create({
        data: {
          name: validatedData.name,
          value: validatedData.value,
          iv: validatedData.iv || "",
          encryptionKey: validatedData.encryptionKey || "",
          userId: session.user.id,
          containerId: validatedData.containerId || "",
          note: validatedData.note,
        },
      })

      return {
        success: true,
        secret: SecretEntity.getSimpleRo(secret),
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Secret creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get secret by ID
 */
export async function getSecretById(id: string): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const secret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    return {
      success: true,
      secret: SecretEntity.getSimpleRo(secret),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get secret error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a secret
 */
export async function updateSecret(
  id: string,
  data: Partial<SecretDtoType>
): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure secret exists and belongs to user
    const existingSecret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingSecret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialSecretSchema = SecretDto.partial()
    const validatedData = partialSecretSchema.parse(data)

    // Update data is ready to use directly
    const updateData: any = { ...validatedData, updatedAt: new Date() }

    try {
      // Update secret with Prisma
      const updatedSecret = await database.secret.update({
        where: { id },
        data: updateData,
      })

      return {
        success: true,
        secret: SecretEntity.getSimpleRo(updatedSecret),
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Secret update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a secret
 */
export async function deleteSecret(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure secret exists and belongs to user
    const existingSecret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingSecret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Delete secret with Prisma
    await database.secret.delete({
      where: { id },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Secret deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List secrets with optional filtering and pagination
 */
export async function listSecrets(
  page = 1,
  limit = 10,
  containerId?: string,
  platformId?: string
): Promise<{
  success: boolean
  secrets?: SecretSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()

    const skip = (page - 1) * limit

    // Build filters
    const where: Prisma.SecretWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    // Note: platformId filtering removed as it's not part of Secret model

    const [secrets, total] = await Promise.all([
      database.secret.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.secret.count({ where }),
    ])

    return {
      success: true,
      secrets: secrets.map((secret) => SecretEntity.getSimpleRo(secret)),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List secrets error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new secret with optional metadata
 */
export async function createSecretWithMetadata(
  secretData: SecretDtoType,
  metadataData?: Omit<SecretMetadataDto, "secretId">
): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedSecretData = SecretDto.parse(secretData)

    try {
      // Use a transaction to create both secret and metadata
      const result = await database.$transaction(async (tx) => {
        const secret = await tx.secret.create({
          data: {
            name: validatedSecretData.name,
            value: validatedSecretData.value,
            iv: validatedSecretData.iv || "",
            encryptionKey: validatedSecretData.encryptionKey || "",
            userId: session.user.id,
            containerId: validatedSecretData.containerId || "",
            note: validatedSecretData.note,
          },
        })

        // Create metadata if provided
        if (metadataData) {
          await tx.secretMetadata.create({
            data: {
              ...metadataData,
              secretId: secret.id,
              otherInfo: metadataData.otherInfo || [],
            },
          })
        }

        return secret
      })

      return {
        success: true,
        secret: SecretEntity.getSimpleRo(result),
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Secret creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
