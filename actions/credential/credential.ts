"use server"

import { CredentialEntity } from "@/entities/credential/credential"
import { database } from "@/prisma/client"
import {
  CredentialDto,
  credentialDtoSchema,
  CredentialSimpleRo,
  DeleteCredentialDto,
  deleteCredentialDtoSchema,
  GetCredentialByIdDto,
  getCredentialByIdDtoSchema,
  UpdateCredentialDto,
  updateCredentialDtoSchema,
  type CredentialMetadataDto as CredentialMetadataDtoType,
} from "@/schemas/credential"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"
import { getOrReturnEmptyObject } from "@/lib/utils"

import { createEncryptedData } from "../encryption"
import { createTagsAndGetConnections } from "../utils/tag"

/**
 * Get credential by ID (Simple RO)
 */
export async function getSimpleCredentialById(id: string): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const credential = await database.credential.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!credential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    return {
      success: true,
      credential: CredentialEntity.getSimpleRo(credential),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get simple credential error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get credential by ID (Full RO with relations)
 */
export async function getCredentialById(data: GetCredentialByIdDto): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getCredentialByIdDtoSchema.parse(data)

    const result = await getSimpleCredentialById(validatedData.id)

    // Update last viewed timestamp if credential was found
    if (result.success && result.credential) {
      await database.credential.update({
        where: { id: validatedData.id },
        data: { lastViewed: new Date() },
      })
    }

    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Get credential error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new credential
 */
export async function createCredential(data: CredentialDto): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = credentialDtoSchema.parse(data)

    try {
      const platform = await database.platform.findUnique({
        where: { id: validatedData.platformId },
      })

      if (!platform) {
        return {
          success: false,
          error: "Platform not found",
        }
      }

      const tagConnections = await createTagsAndGetConnections(
        validatedData.tags,
        session.user.id,
        validatedData.containerId
      )

      // Create encrypted data for password
      const passwordEncryptionResult = await createEncryptedData({
        encryptedValue: validatedData.passwordEncryption.encryptedValue,
        encryptionKey: validatedData.passwordEncryption.encryptionKey,
        iv: validatedData.passwordEncryption.iv,
      })

      if (
        !passwordEncryptionResult.success ||
        !passwordEncryptionResult.encryptedData
      ) {
        return {
          success: false,
          error: "Failed to encrypt password",
        }
      }

      const credential = await database.credential.create({
        data: {
          identifier: validatedData.identifier,
          passwordEncryptionId: passwordEncryptionResult.encryptedData.id,
          status: validatedData.status,
          platformId: validatedData.platformId,
          description: validatedData.description,
          userId: session.user.id,
          tags: tagConnections,
          ...getOrReturnEmptyObject(validatedData.containerId, "containerId"),
        },
        include: {
          passwordEncryption: true,
        },
      })

      return {
        success: true,
        credential: CredentialEntity.getSimpleRo(credential),
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

    console.error("Credential creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a credential
 */
export async function updateCredential(data: UpdateCredentialDto): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = updateCredentialDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleCredentialById to check if credential exists and belongs to user
    const existingCredentialResult = await getSimpleCredentialById(id)
    if (!existingCredentialResult.success) {
      return existingCredentialResult
    }

    // Validate using our DTO schema (partial)
    const partialCredentialSchema = credentialDtoSchema.partial()
    const validatedUpdateData = partialCredentialSchema.parse(updateData)

    const updatePayload: Record<string, unknown> = {}

    // Handle password encryption update if provided
    if (validatedUpdateData.passwordEncryption) {
      const passwordEncryptionResult = await createEncryptedData({
        encryptedValue: validatedUpdateData.passwordEncryption.encryptedValue,
        encryptionKey: validatedUpdateData.passwordEncryption.encryptionKey,
        iv: validatedUpdateData.passwordEncryption.iv,
      })

      if (
        !passwordEncryptionResult.success ||
        !passwordEncryptionResult.encryptedData
      ) {
        return {
          success: false,
          error: "Failed to encrypt password",
        }
      }

      updatePayload.passwordEncryptionId =
        passwordEncryptionResult.encryptedData.id

      // Create credential history entry for password change
      await database.credentialHistory.create({
        data: {
          credentialId: id,
          passwordEncryptionId: passwordEncryptionResult.encryptedData.id,
          userId: session.user.id,
        },
      })
    }

    // Handle tags if provided
    if (validatedUpdateData.tags) {
      const tagConnections = await createTagsAndGetConnections(
        validatedUpdateData.tags,
        session.user.id,
        validatedUpdateData.containerId
      )
      updatePayload.tags = tagConnections
    }

    // Add other fields
    Object.assign(updatePayload, {
      identifier: validatedUpdateData.identifier,
      status: validatedUpdateData.status,
      description: validatedUpdateData.description,
      platformId: validatedUpdateData.platformId,
      ...getOrReturnEmptyObject(validatedUpdateData.containerId, "containerId"),
      updatedAt: new Date(),
    })

    const updatedCredential = await database.credential.update({
      where: { id },
      data: updatePayload,
      include: {
        passwordEncryption: true,
      },
    })

    return {
      success: true,
      credential: CredentialEntity.getSimpleRo(updatedCredential),
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

    console.error("Credential update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a credential
 */
export async function deleteCredential(data: DeleteCredentialDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = deleteCredentialDtoSchema.parse(data)

    // Use getSimpleCredentialById to check if credential exists and belongs to user
    const existingCredentialResult = await getSimpleCredentialById(
      validatedData.id
    )
    if (!existingCredentialResult.success) {
      return {
        success: false,
        error: existingCredentialResult.error,
      }
    }

    await database.credential.delete({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      },
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
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Credential deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List credentials with pagination
 */
export async function listCredentials(
  page = 1,
  limit = 10,
  containerId?: string,
  platformId?: string
): Promise<{
  success: boolean
  credentials?: CredentialSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()
    const skip = (page - 1) * limit

    const whereClause: Prisma.CredentialWhereInput = {
      userId: session.user.id,
      ...(containerId && { containerId }),
      ...(platformId && { platformId }),
    }

    const [credentials, total] = await Promise.all([
      database.credential.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          passwordEncryption: true,
        },
      }),
      database.credential.count({ where: whereClause }),
    ])

    return {
      success: true,
      credentials: credentials.map((credential) =>
        CredentialEntity.getSimpleRo(credential)
      ),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List credentials error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Copy credential password (for clipboard functionality)
 */
export async function copyCredentialPassword(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Use getSimpleCredentialById to check if credential exists and belongs to user
    const credentialResult = await getSimpleCredentialById(id)
    if (!credentialResult.success) {
      return credentialResult
    }

    // Update last viewed timestamp
    await database.credential.update({
      where: { id },
      data: { lastViewed: new Date() },
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
    console.error("Copy credential password error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a credential with metadata
 */
export async function createCredentialWithMetadata(
  credentialData: CredentialDto,
  metadataData?: Omit<CredentialMetadataDtoType, "credentialId">
): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    // First create the credential
    const credentialResult = await createCredential(credentialData)

    if (!credentialResult.success || !credentialResult.credential) {
      return credentialResult
    }

    // If metadata is provided, create it
    if (metadataData) {
      const { createCredentialMetadata } = await import("./credential-metadata")

      const metadataResult = await createCredentialMetadata({
        ...metadataData,
        credentialId: credentialResult.credential.id,
      })

      if (!metadataResult.success) {
        // If metadata creation fails, we should probably delete the credential
        // But for now, we'll just return the credential without metadata
        console.warn(
          "Credential created but metadata creation failed:",
          metadataResult.error
        )
      }
    }

    return credentialResult
  } catch (error) {
    console.error("Create credential with metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
