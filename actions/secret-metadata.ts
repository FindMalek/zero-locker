"use server"

import { database } from "@/prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

// Define SecretMetadata DTO
const SecretMetadataDto = z.object({
  secretId: z.string(),
  type: z.enum(["API_KEY", "ENV_VARIABLE", "DATABASE_URL", "CLOUD_STORAGE_KEY", "THIRD_PARTY_API_KEY"]),
  status: z.enum(["ACTIVE", "EXPIRED", "REVOKED"]).default("ACTIVE"),
  otherInfo: z.array(z.any()).default([]),
  expiresAt: z.date().optional(),
})

export type SecretMetadataDto = z.infer<typeof SecretMetadataDto>

/**
 * Create secret metadata
 */
export async function createSecretMetadata(
  data: SecretMetadataDto
): Promise<{
  success: boolean
  metadata?: any
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = SecretMetadataDto.parse(data)

    // Check if secret exists and belongs to the user
    const secret = await database.secret.findFirst({
      where: {
        id: validatedData.secretId,
        userId: session.user.id,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Check if metadata already exists for this secret
    const existingMetadata = await database.secretMetadata.findFirst({
      where: { secretId: validatedData.secretId },
    })

    if (existingMetadata) {
      return {
        success: false,
        error: "Metadata already exists for this secret",
      }
    }

    // Create metadata
    const metadata = await database.secretMetadata.create({
      data: validatedData,
    })

    return {
      success: true,
      metadata,
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

    console.error("Secret metadata creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get secret metadata
 */
export async function getSecretMetadata(secretId: string): Promise<{
  success: boolean
  metadata?: any
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if secret exists and belongs to the user
    const secret = await database.secret.findFirst({
      where: {
        id: secretId,
        userId: session.user.id,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Get metadata
    const metadata = await database.secretMetadata.findFirst({
      where: { secretId },
    })

    if (!metadata) {
      return {
        success: false,
        error: "Metadata not found for this secret",
      }
    }

    return {
      success: true,
      metadata,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get secret metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update secret metadata
 */
export async function updateSecretMetadata(
  id: string,
  data: Partial<SecretMetadataDto>
): Promise<{
  success: boolean
  metadata?: any
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.secretMetadata.findUnique({
      where: { id },
      include: { secret: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if secret belongs to the user
    if (existingMetadata.secret.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Validate data
    const partialSchema = SecretMetadataDto.partial()
    const validatedData = partialSchema.parse(data)

    // Update metadata
    const updatedMetadata = await database.secretMetadata.update({
      where: { id },
      data: validatedData,
    })

    return {
      success: true,
      metadata: updatedMetadata,
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

    console.error("Secret metadata update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete secret metadata
 */
export async function deleteSecretMetadata(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.secretMetadata.findUnique({
      where: { id },
      include: { secret: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if secret belongs to the user
    if (existingMetadata.secret.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Delete metadata
    await database.secretMetadata.delete({
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
    console.error("Delete secret metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
} 