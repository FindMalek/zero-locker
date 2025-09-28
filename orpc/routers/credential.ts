import {
  CredentialEntity,
  CredentialQuery,
} from "@/entities/credential/credential"
import { CredentialMetadataQuery } from "@/entities/credential/credential-metadata/query"
import { authMiddleware } from "@/middleware/auth"
import { requirePermission } from "@/middleware/permissions"
import { database } from "@/prisma/client"
import { credentialFormDtoSchema } from "@/schemas/credential/credential"
import { credentialKeyValuePairWithValueRoSchema } from "@/schemas/credential/credential-key-value"
import {
  createCredentialWithMetadataInputSchema,
  createCredentialWithMetadataOutputSchema,
  type CreateCredentialWithMetadataInput,
  type CreateCredentialWithMetadataOutput,
} from "@/schemas/credential/credential-with-metadata"
import {
  createCredentialInputSchema,
  credentialOutputSchema,
  deleteCredentialInputSchema,
  getCredentialInputSchema,
  listCredentialsInputSchema,
  listCredentialsOutputSchema,
  updateCredentialInputSchema,
  updateCredentialPasswordInputSchema,
  type CredentialOutput,
  type ListCredentialsOutput,
} from "@/schemas/credential/dto"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"
import { z } from "zod"

import { decryptData, encryptData } from "@/lib/encryption"
import { Feature, PermissionLevel } from "@/lib/permissions"
import { getOrReturnEmptyObject } from "@/lib/utils"
import { createEncryptedData } from "@/lib/utils/encryption-helpers"
import { createTagsAndGetConnections } from "@/lib/utils/tag-helpers"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// Get credential by ID
export const getCredential = authProcedure
  .input(getCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Update last viewed timestamp
    await database.credential.update({
      where: { id: input.id },
      data: { lastViewed: new Date() },
    })

    return CredentialEntity.getSimpleRo(credential)
  })

// Get credential security settings (decrypted on server for security)
export const getCredentialSecuritySettings = authProcedure
  .input(getCredentialInputSchema)
  .output(
    z.object({
      passwordProtection: z.boolean(),
      twoFactorAuth: z.boolean(),
      accessLogging: z.boolean(),
    })
  )
  .handler(
    async ({
      input,
      context,
    }): Promise<{
      passwordProtection: boolean
      twoFactorAuth: boolean
      accessLogging: boolean
    }> => {
      const credential = await database.credential.findFirst({
        where: {
          id: input.id,
          userId: context.user.id,
        },
        include: CredentialQuery.getInclude(),
      })

      if (!credential) {
        throw new ORPCError("NOT_FOUND")
      }

      return await CredentialEntity.getSecuritySettings(credential)
    }
  )

// Get credential key-value pairs (keys only, no values for security)
export const getCredentialKeyValuePairs = authProcedure
  .input(getCredentialInputSchema)
  .output(
    z.array(
      z.object({
        id: z.string(),
        key: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    )
  )
  .handler(async ({ input, context }) => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(), // Note: Uses full include but only returns safe fields
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    const metadata = credential.metadata?.[0]
    if (!metadata || !metadata.keyValuePairs) {
      return []
    }

    // Return only keys and metadata, no values for security
    const pairs = metadata.keyValuePairs
      .filter(
        (kvPair) =>
          kvPair.key !== "passwordProtection" && kvPair.key !== "accessLogging"
      )
      .map((kvPair) => ({
        id: kvPair.id,
        key: kvPair.key,
        createdAt: kvPair.createdAt,
        updatedAt: kvPair.updatedAt,
      }))

    return pairs
  })

// Get credential key-value pairs with values (for editing mode)
export const getCredentialKeyValuePairsWithValues = authProcedure
  .input(getCredentialInputSchema)
  .output(z.array(credentialKeyValuePairWithValueRoSchema))
  .handler(async ({ input, context }) => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(),
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    const metadata = credential.metadata?.[0]
    if (!metadata || !metadata.keyValuePairs) {
      return []
    }

    // Filter out security settings and decrypt values
    const filteredPairs = metadata.keyValuePairs.filter(
      (kvPair) =>
        kvPair.key !== "passwordProtection" && kvPair.key !== "accessLogging"
    )

    const pairsWithValues = await Promise.all(
      filteredPairs.map(async (kvPair) => {
        try {
          const decryptedValue = await decryptData(
            kvPair.valueEncryption.encryptedValue,
            kvPair.valueEncryption.iv,
            kvPair.valueEncryption.encryptionKey
          )

          return {
            id: kvPair.id,
            key: kvPair.key,
            value: decryptedValue,
            createdAt: kvPair.createdAt,
            updatedAt: kvPair.updatedAt,
          }
        } catch (error) {
          console.error(`Failed to decrypt key-value pair ${kvPair.id}:`, error)
          // Return pair with empty value if decryption fails
          return {
            id: kvPair.id,
            key: kvPair.key,
            value: "",
            createdAt: kvPair.createdAt,
            updatedAt: kvPair.updatedAt,
          }
        }
      })
    )

    return pairsWithValues
  })

// Get specific key-value pair value (for viewing)
export const getCredentialKeyValuePairValue = authProcedure
  .input(
    z.object({
      credentialId: z.string(),
      keyValuePairId: z.string(),
    })
  )
  .output(
    z.object({
      value: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.credentialId,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(),
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    const metadata = credential.metadata?.[0]
    if (!metadata || !metadata.keyValuePairs) {
      throw new ORPCError("NOT_FOUND", { message: "Key-value pair not found" })
    }

    const kvPair = metadata.keyValuePairs.find(
      (kv) => kv.id === input.keyValuePairId
    )
    if (!kvPair) {
      throw new ORPCError("NOT_FOUND", { message: "Key-value pair not found" })
    }

    try {
      const decryptedValue = await decryptData(
        kvPair.valueEncryption.encryptedValue,
        kvPair.valueEncryption.iv,
        kvPair.valueEncryption.encryptionKey
      )

      return { value: decryptedValue }
    } catch (error) {
      console.error(`Failed to decrypt key-value pair ${kvPair.id}:`, error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to decrypt value",
      })
    }
  })

// Get credential password (decrypted on server for security)
export const getCredentialPassword = authProcedure
  .input(getCredentialInputSchema)
  .output(z.object({ password: z.string() }))
  .handler(async ({ input, context }): Promise<{ password: string }> => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: {
        passwordEncryption: true,
      },
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    if (!credential.passwordEncryption) {
      throw new ORPCError("NOT_FOUND", {
        message: "Password encryption data not found",
      })
    }

    try {
      // Decrypt password on server for security
      const decryptedPassword = await decryptData(
        credential.passwordEncryption.encryptedValue,
        credential.passwordEncryption.iv,
        credential.passwordEncryption.encryptionKey
      )

      // Update last viewed timestamp
      await database.credential.update({
        where: { id: input.id },
        data: { lastViewed: new Date() },
      })

      return { password: decryptedPassword }
    } catch (error) {
      console.error("Failed to decrypt password:", error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to decrypt password",
      })
    }
  })

// List credentials with pagination
export const listCredentials = authProcedure
  .input(listCredentialsInputSchema)
  .output(listCredentialsOutputSchema)
  .handler(async ({ input, context }): Promise<ListCredentialsOutput> => {
    const { page, limit, search, containerId, platformId } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      ...(platformId && { platformId }),
      ...(search && {
        OR: [
          { identifier: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [credentials, total] = await Promise.all([
      database.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { ...CredentialQuery.getInclude() },
      }),
      database.credential.count({ where }),
    ])

    return {
      credentials: credentials.map((credential) =>
        CredentialEntity.getRo(credential)
      ),
      total,
      hasMore: skip + credentials.length < total,
      page,
      limit,
    }
  })

// Create credential
export const createCredential = authProcedure
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
  .input(createCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    // Verify platform exists
    const platform = await database.platform.findUnique({
      where: { id: input.platformId },
    })

    if (!platform) {
      throw new ORPCError("NOT_FOUND")
    }

    // Check if credential with same identifier already exists for this platform and user
    const existingCredential = await database.credential.findFirst({
      where: {
        identifier: input.identifier,
        platformId: input.platformId,
        userId: context.user.id,
      },
    })

    if (existingCredential) {
      throw new ORPCError("CONFLICT", {
        message:
          "A credential with this identifier already exists for this platform",
      })
    }

    // Use transaction for atomicity
    const credential = await database.$transaction(async (tx) => {
      const tagConnections = await createTagsAndGetConnections(
        input.tags,
        context.user.id,
        input.containerId,
        tx
      )

      // Create encrypted data for password
      const passwordEncryptionResult = await createEncryptedData(
        {
          encryptedValue: input.passwordEncryption.encryptedValue,
          encryptionKey: input.passwordEncryption.encryptionKey,
          iv: input.passwordEncryption.iv,
        },
        tx
      )

      if (
        !passwordEncryptionResult.success ||
        !passwordEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      return await tx.credential.create({
        data: {
          identifier: input.identifier,
          passwordEncryptionId: passwordEncryptionResult.encryptedData.id,
          status: input.status,
          platformId: input.platformId,
          description: input.description,
          userId: context.user.id,
          tags: tagConnections,
          ...getOrReturnEmptyObject(input.containerId, "containerId"),
        },
      })
    })

    return CredentialEntity.getSimpleRo(credential)
  })

// Update credential
export const updateCredential = authProcedure
  .input(updateCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    const { id, ...updateData } = input

    // Verify credential ownership
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Check for duplicate identifier if identifier or platformId is being updated
    if (
      updateData.identifier !== undefined ||
      updateData.platformId !== undefined
    ) {
      const newIdentifier =
        updateData.identifier ?? existingCredential.identifier
      const newPlatformId =
        updateData.platformId ?? existingCredential.platformId

      const duplicateCredential = await database.credential.findFirst({
        where: {
          identifier: newIdentifier,
          platformId: newPlatformId,
          userId: context.user.id,
          NOT: { id }, // Exclude current credential
        },
      })

      if (duplicateCredential) {
        throw new ORPCError("CONFLICT", {
          message:
            "A credential with this identifier already exists for this platform",
        })
      }
    }

    // Process the update data
    const updatePayload: Prisma.CredentialUpdateInput = {}

    if (updateData.identifier !== undefined)
      updatePayload.identifier = updateData.identifier
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description
    if (updateData.status !== undefined)
      updatePayload.status = updateData.status
    if (updateData.platformId !== undefined)
      updatePayload.platform = { connect: { id: updateData.platformId } }
    if (updateData.containerId !== undefined) {
      updatePayload.container = updateData.containerId
        ? { connect: { id: updateData.containerId } }
        : { disconnect: true }
    }

    // Handle tags if provided
    if (updateData.tags !== undefined) {
      const tagConnections = await createTagsAndGetConnections(
        updateData.tags,
        context.user.id,
        updateData.containerId || existingCredential.containerId || undefined
      )
      updatePayload.tags = tagConnections
    }

    // Handle password encryption updates if provided
    if (updateData.passwordEncryption) {
      const passwordEncryptionResult = await createEncryptedData({
        encryptedValue: updateData.passwordEncryption.encryptedValue,
        encryptionKey: updateData.passwordEncryption.encryptionKey,
        iv: updateData.passwordEncryption.iv,
      })

      if (
        !passwordEncryptionResult.success ||
        !passwordEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      updatePayload.passwordEncryption = {
        connect: { id: passwordEncryptionResult.encryptedData.id },
      }
    }

    const updatedCredential = await database.credential.update({
      where: { id },
      data: updatePayload,
    })

    return CredentialEntity.getSimpleRo(updatedCredential)
  })

// Update credential password with version control history
export const updateCredentialPassword = authProcedure
  .input(updateCredentialPasswordInputSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { id, passwordEncryption } = input

    // Verify credential ownership and get current password encryption
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
      include: {
        passwordEncryption: true,
      },
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Use transaction for atomicity
    await database.$transaction(async (tx) => {
      // Create new encrypted data for the new password
      const newPasswordEncryptionResult = await createEncryptedData({
        encryptedValue: passwordEncryption.encryptedValue,
        encryptionKey: passwordEncryption.encryptionKey,
        iv: passwordEncryption.iv,
      })

      if (
        !newPasswordEncryptionResult.success ||
        !newPasswordEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to encrypt new password",
        })
      }

      // Create history entry with the old password
      await tx.credentialHistory.create({
        data: {
          credentialId: id,
          userId: context.user.id,
          passwordEncryptionId: existingCredential.passwordEncryptionId,
          changedAt: new Date(),
        },
      })

      // Update credential with new password
      await tx.credential.update({
        where: { id },
        data: {
          passwordEncryptionId: newPasswordEncryptionResult.encryptedData.id,
        },
      })
    })

    return { success: true }
  })

// Update credential with security settings
export const updateCredentialWithSecuritySettings = authProcedure
  .input(credentialFormDtoSchema.extend({ id: z.string() }))
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    const {
      id,
      passwordProtection,
      twoFactorAuth,
      accessLogging,
      ...updateData
    } = input

    // Verify credential ownership
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(),
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Use transaction for atomicity
    const updatedCredential = await database.$transaction(async (tx) => {
      // Update basic credential fields first
      const basicUpdatePayload: Prisma.CredentialUpdateInput = {}

      if (updateData.identifier !== undefined)
        basicUpdatePayload.identifier = updateData.identifier
      if (updateData.description !== undefined)
        basicUpdatePayload.description = updateData.description
      if (updateData.status !== undefined)
        basicUpdatePayload.status = updateData.status
      if (updateData.platformId !== undefined)
        basicUpdatePayload.platform = { connect: { id: updateData.platformId } }
      if (updateData.containerId !== undefined) {
        basicUpdatePayload.container = updateData.containerId
          ? { connect: { id: updateData.containerId } }
          : { disconnect: true }
      }

      const credential = await tx.credential.update({
        where: { id },
        data: basicUpdatePayload,
      })

      // Handle metadata updates
      let metadata = existingCredential.metadata?.[0]

      // Create metadata if it doesn't exist
      if (!metadata) {
        metadata = await tx.credentialMetadata.create({
          data: {
            credentialId: id,
            has2FA: twoFactorAuth,
          },
          include: CredentialMetadataQuery.getInclude(),
        })
      } else {
        // Update existing metadata
        await tx.credentialMetadata.update({
          where: { id: metadata.id },
          data: {
            has2FA: twoFactorAuth,
          },
        })
      }

      // Handle passwordProtection setting
      await upsertSecuritySetting(
        tx,
        metadata.id,
        "passwordProtection",
        passwordProtection
      )

      // Handle accessLogging setting
      await upsertSecuritySetting(
        tx,
        metadata.id,
        "accessLogging",
        accessLogging
      )

      return credential
    })

    return CredentialEntity.getSimpleRo(updatedCredential)
  })

// Helper function to upsert security settings as key-value pairs
async function upsertSecuritySetting(
  tx: Prisma.TransactionClient,
  metadataId: string,
  key: string,
  value: boolean
) {
  // Find existing key-value pair
  const existingKvPair = await tx.credentialKeyValuePair.findFirst({
    where: {
      credentialMetadataId: metadataId,
      key,
    },
    include: {
      valueEncryption: true,
    },
  })

  // Generate a random encryption key for this setting
  const crypto = await import("crypto")
  const encryptionKey = crypto.randomBytes(32).toString("base64") // 256-bit key

  // Encrypt the boolean value
  const encryptionResult = await encryptData(
    JSON.stringify(value),
    encryptionKey
  )

  // Create encrypted data entry
  const encryptedDataResult = await createEncryptedData({
    encryptedValue: encryptionResult.encryptedData,
    encryptionKey: encryptionKey,
    iv: encryptionResult.iv,
  })

  if (!encryptedDataResult.success || !encryptedDataResult.encryptedData) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to encrypt security setting",
    })
  }

  if (existingKvPair) {
    // Update existing key-value pair with new encrypted value
    await tx.credentialKeyValuePair.update({
      where: { id: existingKvPair.id },
      data: {
        valueEncryptionId: encryptedDataResult.encryptedData.id,
      },
    })

    // Clean up old encrypted data if it exists
    if (existingKvPair.valueEncryption) {
      await tx.encryptedData.delete({
        where: { id: existingKvPair.valueEncryption.id },
      })
    }
  } else {
    // Create new key-value pair
    await tx.credentialKeyValuePair.create({
      data: {
        key,
        valueEncryptionId: encryptedDataResult.encryptedData.id,
        credentialMetadataId: metadataId,
      },
    })
  }
}

// Delete credential
export const deleteCredential = authProcedure
  .input(deleteCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    // Verify credential ownership
    const existingCredential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    const deletedCredential = await database.credential.delete({
      where: { id: input.id },
    })

    return CredentialEntity.getSimpleRo(deletedCredential)
  })

// Create credential with metadata
export const createCredentialWithMetadata = authProcedure
  .input(createCredentialWithMetadataInputSchema)
  .output(createCredentialWithMetadataOutputSchema)
  .handler(
    async ({ input, context }): Promise<CreateCredentialWithMetadataOutput> => {
      const { credential: credentialData, metadata } = input

      try {
        // Verify platform exists
        const platform = await database.platform.findUnique({
          where: { id: credentialData.platformId },
        })

        if (!platform) {
          throw new ORPCError("NOT_FOUND")
        }

        // Check if credential with same identifier already exists for this platform and user
        const existingCredential = await database.credential.findFirst({
          where: {
            identifier: credentialData.identifier,
            platformId: credentialData.platformId,
            userId: context.user.id,
          },
        })

        if (existingCredential) {
          throw new ORPCError("CONFLICT", {
            message:
              "A credential with this identifier already exists for this platform",
          })
        }

        const result = await database.$transaction(async (tx) => {
          const tagConnections = await createTagsAndGetConnections(
            credentialData.tags,
            context.user.id,
            credentialData.containerId,
            tx
          )

          // Create encrypted data for password
          const passwordEncryptionResult = await createEncryptedData(
            {
              encryptedValue: credentialData.passwordEncryption.encryptedValue,
              encryptionKey: credentialData.passwordEncryption.encryptionKey,
              iv: credentialData.passwordEncryption.iv,
            },
            tx
          )

          if (
            !passwordEncryptionResult.success ||
            !passwordEncryptionResult.encryptedData
          ) {
            throw new ORPCError("INTERNAL_SERVER_ERROR")
          }
          const credential = await tx.credential.create({
            data: {
              identifier: credentialData.identifier,
              passwordEncryptionId: passwordEncryptionResult.encryptedData!.id,
              status: credentialData.status,
              platformId: credentialData.platformId,
              description: credentialData.description,
              userId: context.user.id,
              tags: tagConnections,
              ...getOrReturnEmptyObject(
                credentialData.containerId,
                "containerId"
              ),
            },
          })

          // Create metadata if provided
          if (metadata) {
            const credentialMetadata = await tx.credentialMetadata.create({
              data: {
                credentialId: credential.id,
                recoveryEmail: metadata.recoveryEmail,
                phoneNumber: metadata.phoneNumber,
                has2FA: metadata.has2FA || false,
              },
            })

            // Create encrypted key-value pairs if provided
            if (metadata.keyValuePairs && metadata.keyValuePairs.length > 0) {
              for (const kvPair of metadata.keyValuePairs) {
                // Create encrypted data for the value
                const valueEncryptionResult = await createEncryptedData(
                  {
                    encryptedValue: kvPair.valueEncryption.encryptedValue,
                    encryptionKey: kvPair.valueEncryption.encryptionKey,
                    iv: kvPair.valueEncryption.iv,
                  },
                  tx
                )

                if (
                  !valueEncryptionResult.success ||
                  !valueEncryptionResult.encryptedData
                ) {
                  throw new ORPCError("INTERNAL_SERVER_ERROR", {
                    message:
                      "Failed to create encrypted data for key-value pair",
                  })
                }

                // Create the key-value pair
                await tx.credentialKeyValuePair.create({
                  data: {
                    key: kvPair.key,
                    valueEncryptionId: valueEncryptionResult.encryptedData.id,
                    credentialMetadataId: credentialMetadata.id,
                  },
                })
              }
            }
          }

          return credential
        })

        return {
          success: true,
          credential: CredentialEntity.getSimpleRo(result),
        }
      } catch (error) {
        console.error("Error creating credential with metadata:", error)

        // If it's an ORPCError, re-throw it to maintain consistent error handling
        if (error instanceof ORPCError) {
          throw error
        }

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }
      }
    }
  )

// Update credential key-value pairs
export const updateCredentialKeyValuePairs = authProcedure
  .input(
    z.object({
      credentialId: z.string(),
      keyValuePairs: z.array(
        z.object({
          id: z.string().optional(),
          key: z.string(),
          value: z.string().optional(),
        })
      ),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { credentialId, keyValuePairs } = input

    // Verify credential ownership
    const credential = await database.credential.findFirst({
      where: {
        id: credentialId,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(),
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Use transaction for atomicity
    await database.$transaction(async (tx) => {
      let metadata = credential.metadata?.[0]

      // Create metadata if it doesn't exist
      if (!metadata) {
        metadata = await tx.credentialMetadata.create({
          data: {
            credentialId: credentialId,
            has2FA: false,
          },
          include: CredentialMetadataQuery.getInclude(),
        })
      }

      // Get existing key-value pairs (excluding security settings)
      const existingKvPairs =
        metadata.keyValuePairs?.filter(
          (kv) => kv.key !== "passwordProtection" && kv.key !== "accessLogging"
        ) || []

      // Delete removed key-value pairs
      const newKeys = keyValuePairs.map((kv) => kv.key)
      const toDelete = existingKvPairs.filter(
        (existing) => !newKeys.includes(existing.key)
      )

      for (const kvPair of toDelete) {
        await tx.credentialKeyValuePair.delete({
          where: { id: kvPair.id },
        })
        // Also delete the encrypted data
        await tx.encryptedData.delete({
          where: { id: kvPair.valueEncryptionId },
        })
      }

      // Update or create key-value pairs
      for (const kvPair of keyValuePairs) {
        if (!kvPair.key.trim()) continue

        const existingKvPair = existingKvPairs.find(
          (existing) => existing.key === kvPair.key
        )

        if (existingKvPair) {
          // For existing pairs, only update if a new value is provided
          if (kvPair.value && kvPair.value.trim()) {
            // Generate encryption for the new value
            const crypto = await import("crypto")
            const encryptionKey = crypto.randomBytes(32).toString("base64")
            const encryptionResult = await encryptData(
              kvPair.value,
              encryptionKey
            )

            const encryptedDataResult = await createEncryptedData({
              encryptedValue: encryptionResult.encryptedData,
              encryptionKey: encryptionKey,
              iv: encryptionResult.iv,
            })

            if (
              !encryptedDataResult.success ||
              !encryptedDataResult.encryptedData
            ) {
              throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to encrypt key-value pair",
              })
            }

            // Update existing with new encrypted value
            await tx.credentialKeyValuePair.update({
              where: { id: existingKvPair.id },
              data: {
                valueEncryptionId: encryptedDataResult.encryptedData.id,
              },
            })

            // Delete old encrypted data
            await tx.encryptedData.delete({
              where: { id: existingKvPair.valueEncryptionId },
            })
          }
          // If no value provided, preserve existing (no update needed)
        } else {
          // Create new pair - value is required for new pairs
          if (!kvPair.value || !kvPair.value.trim()) continue

          // Generate encryption for the value
          const crypto = await import("crypto")
          const encryptionKey = crypto.randomBytes(32).toString("base64")
          const encryptionResult = await encryptData(
            kvPair.value,
            encryptionKey
          )

          const encryptedDataResult = await createEncryptedData({
            encryptedValue: encryptionResult.encryptedData,
            encryptionKey: encryptionKey,
            iv: encryptionResult.iv,
          })

          if (
            !encryptedDataResult.success ||
            !encryptedDataResult.encryptedData
          ) {
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
              message: "Failed to encrypt key-value pair",
            })
          }

          // Create new
          await tx.credentialKeyValuePair.create({
            data: {
              key: kvPair.key,
              valueEncryptionId: encryptedDataResult.encryptedData.id,
              credentialMetadataId: metadata.id,
            },
          })
        }
      }
    })

    return { success: true }
  })

// Export the credential router
export const credentialRouter = {
  get: getCredential,
  getPassword: getCredentialPassword,
  getSecuritySettings: getCredentialSecuritySettings,
  getKeyValuePairs: getCredentialKeyValuePairs,
  getKeyValuePairsWithValues: getCredentialKeyValuePairsWithValues,
  getKeyValuePairValue: getCredentialKeyValuePairValue,
  list: listCredentials,
  create: createCredential,
  createWithMetadata: createCredentialWithMetadata,
  update: updateCredential,
  updatePassword: updateCredentialPassword,
  updateWithSecuritySettings: updateCredentialWithSecuritySettings,
  updateKeyValuePairs: updateCredentialKeyValuePairs,
  delete: deleteCredential,
}
