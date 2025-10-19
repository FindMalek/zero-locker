import {
  CredentialEntity,
  CredentialQuery,
} from "@/entities/credential/credential"
import { CredentialMetadataQuery } from "@/entities/credential/credential-metadata/query"
import { authMiddleware } from "@/middleware/auth"
import {
  requireDefaultContainerAccess,
  requirePermission,
} from "@/middleware/permissions"
import { database } from "@/prisma/client"
import {
  createCredentialInputSchema,
  credentialFormDtoSchema,
  credentialOutputSchema,
  deleteCredentialInputSchema,
  duplicateCredentialInputSchema,
  getCredentialInputSchema,
  listCredentialsInputSchema,
  listCredentialsOutputSchema,
  updateCredentialInputSchema,
  updateCredentialPasswordInputSchema,
  type CredentialOutput,
  type ListCredentialsOutput,
} from "@/schemas/credential"
import { credentialKeyValuePairWithValueRoSchema } from "@/schemas/credential/key-value"
import {
  createCredentialWithMetadataInputSchema,
  createCredentialWithMetadataOutputSchema,
  type CreateCredentialWithMetadataInput,
  type CreateCredentialWithMetadataOutput,
} from "@/schemas/credential/with-metadata"
import { ORPCError, os } from "@orpc/server"
import { AccountStatus, type Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
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
const authWithDefaultAccessProcedure = authProcedure.use(({ context, next }) =>
  requireDefaultContainerAccess()({ context, next })
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
          // Check if this is an empty value (from duplication)
          if (
            !kvPair.valueEncryption.encryptedValue ||
            kvPair.valueEncryption.encryptedValue.trim() === ""
          ) {
            return {
              id: kvPair.id,
              key: kvPair.key,
              value: "",
              createdAt: kvPair.createdAt,
              updatedAt: kvPair.updatedAt,
            }
          }

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
      // Check if this is an empty value (from duplication)
      if (
        !kvPair.valueEncryption.encryptedValue ||
        kvPair.valueEncryption.encryptedValue.trim() === ""
      ) {
        return { value: "" }
      }

      const decryptedValue = await decryptData(
        kvPair.valueEncryption.encryptedValue,
        kvPair.valueEncryption.iv,
        kvPair.valueEncryption.encryptionKey
      )

      return { value: decryptedValue }
    } catch (error) {
      console.error(`Failed to decrypt key-value pair ${kvPair.id}:`, error)
      // Return empty value if decryption fails (likely from duplication)
      return { value: "" }
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
      // Check if this is an empty password (from duplication)
      if (
        !credential.passwordEncryption.encryptedValue ||
        credential.passwordEncryption.encryptedValue.trim() === ""
      ) {
        return { password: "" }
      }

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
      // If decryption fails, return empty password (likely from duplication)
      return { password: "" }
    }
  })

// List credentials with pagination
export const listCredentials = authProcedure
  .input(listCredentialsInputSchema)
  .output(listCredentialsOutputSchema)
  .handler(async ({ input, context }): Promise<ListCredentialsOutput> => {
    const { page, limit, search, containerId, filters, sort } = input
    const skip = (page - 1) * limit

    // Build where clause with filters
    let statusFilter: Prisma.EnumAccountStatusFilter<"Credential"> | undefined

    // Handle status filtering
    if (filters?.statuses && filters.statuses.length > 0) {
      // If specific statuses are selected, use those
      // But if showArchived is false, exclude ARCHIVED from the list
      const statusesToFilter =
        filters.showArchived === false
          ? filters.statuses.filter((s: AccountStatus) => s !== AccountStatus.ARCHIVED)
          : filters.statuses

      if (statusesToFilter.length > 0) {
        statusFilter = { in: statusesToFilter }
      }
    } else if (filters?.showArchived === false) {
      // If no specific statuses but showArchived is false, exclude archived
      statusFilter = { not: AccountStatus.ARCHIVED }
    }

    const where: Prisma.CredentialWhereInput = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      // Status filter
      ...(statusFilter && { status: statusFilter }),
      // Platform filters
      ...(filters?.platformIds &&
        filters.platformIds.length > 0 && {
          platformId: { in: filters.platformIds },
        }),
      // Search filter
      ...(search && {
        OR: [
          { identifier: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    // Build orderBy clause with sorting
    const orderBy: Prisma.CredentialOrderByWithRelationInput = sort?.field
      ? {
          [sort.field]: sort.direction || "asc",
        }
      : { createdAt: "desc" }

    const [credentials, total] = await Promise.all([
      database.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
export const createCredential = authWithDefaultAccessProcedure
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

    // Check if Normal user is trying to use non-default container
    if (
      context.permissions?.canOnlyAccessDefaultContainers &&
      input.containerId
    ) {
      const container = await database.container.findFirst({
        where: {
          id: input.containerId,
          userId: context.user.id,
          isDefault: true,
        },
      })
      if (!container) {
        throw new ORPCError("FORBIDDEN", {
          message: "Your plan only allows using default containers.",
        })
      }
    }

    try {
      // Use transaction for atomicity
      const credential = await database.$transaction(async (tx) => {
        const tagConnections = await createTagsAndGetConnections(
          input.tags || [],
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
    } catch (error) {
      // Handle unique constraint violation
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ORPCError("CONFLICT", {
          message:
            "A credential with this identifier already exists for this platform",
        })
      }
      throw error
    }
  })

// Update credential
export const updateCredential = authProcedure
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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
        updateData.tags || [],
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

    try {
      const updatedCredential = await database.credential.update({
        where: { id },
        data: updatePayload,
      })

      return CredentialEntity.getSimpleRo(updatedCredential)
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ORPCError("CONFLICT", {
          message:
            "A credential with this identifier already exists for this platform",
        })
      }
      throw error
    }
  })

// Update credential password with version control history
export const updateCredentialPassword = authProcedure
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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
      const newPasswordEncryptionResult = await createEncryptedData(
        {
          encryptedValue: passwordEncryption.encryptedValue,
          encryptionKey: passwordEncryption.encryptionKey,
          iv: passwordEncryption.iv,
        },
        tx
      )

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
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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
  const encryptedDataResult = await createEncryptedData(
    {
      encryptedValue: encryptionResult.encryptedData,
      encryptionKey: encryptionKey,
      iv: encryptionResult.iv,
    },
    tx
  )

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
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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
export const createCredentialWithMetadata = authWithDefaultAccessProcedure
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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

        // Check if Normal user is trying to use non-default container
        if (
          context.permissions?.canOnlyAccessDefaultContainers &&
          credentialData.containerId
        ) {
          const container = await database.container.findFirst({
            where: {
              id: credentialData.containerId,
              userId: context.user.id,
              isDefault: true,
            },
          })
          if (!container) {
            throw new ORPCError("FORBIDDEN", {
              message: "Your plan only allows using default containers.",
            })
          }
        }

        const result = await database.$transaction(async (tx) => {
          const tagConnections = await createTagsAndGetConnections(
            credentialData.tags || [],
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

        // Handle unique constraint violation
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new ORPCError("CONFLICT", {
            message:
              "A credential with this identifier already exists for this platform",
          })
        }

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
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
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

            const encryptedDataResult = await createEncryptedData(
              {
                encryptedValue: encryptionResult.encryptedData,
                encryptionKey: encryptionKey,
                iv: encryptionResult.iv,
              },
              tx
            )

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

          const encryptedDataResult = await createEncryptedData(
            {
              encryptedValue: encryptionResult.encryptedData,
              encryptionKey: encryptionKey,
              iv: encryptionResult.iv,
            },
            tx
          )

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

// Duplicate credential
export const duplicateCredential = authProcedure
  .use(({ context, next }) =>
    requirePermission({
      feature: Feature.CREDENTIALS,
      level: PermissionLevel.WRITE,
    })({ context, next })
  )
  .input(duplicateCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    // Get the original credential with all data
    const originalCredential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: CredentialQuery.getInclude(),
    })

    if (!originalCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Get the original password encryption data (for reusing key/IV)
    const passwordData = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: {
        passwordEncryption: true,
      },
    })

    if (!passwordData?.passwordEncryption) {
      throw new ORPCError("NOT_FOUND")
    }

    // Get the original key-value pairs
    const keyValueData = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: {
        metadata: {
          include: {
            keyValuePairs: {
              include: {
                valueEncryption: true,
              },
            },
          },
        },
      },
    })

    const originalKeyValuePairs =
      keyValueData?.metadata?.[0]?.keyValuePairs || []

    // Create the duplicate with a modified identifier
    // Generate unique identifier for duplicate
    const baseIdentifier = originalCredential.identifier
    let duplicateIdentifier = `${baseIdentifier} (Copy)`
    let counter = 1

    // Check if identifier already exists and increment counter
    while (true) {
      const existingCredential = await database.credential.findFirst({
        where: {
          identifier: duplicateIdentifier,
          userId: context.user.id,
        },
      })

      if (!existingCredential) {
        break // Identifier is unique
      }

      // Increment counter and try again
      counter++
      duplicateIdentifier = `${baseIdentifier} (Copy ${counter})`
    }

    try {
      // Use transaction for atomicity
      const duplicatedCredential = await database.$transaction(async (tx) => {
        // Create empty encrypted data for password (user will set new password)
        const emptyPasswordEncryptionResult = await createEncryptedData(
          {
            encryptedValue: "", // Empty password
            encryptionKey: passwordData.passwordEncryption.encryptionKey, // Use same key
            iv: passwordData.passwordEncryption.iv, // Use same IV
          },
          tx
        )

        if (
          !emptyPasswordEncryptionResult.success ||
          !emptyPasswordEncryptionResult.encryptedData
        ) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message:
              emptyPasswordEncryptionResult.error ||
              "Failed to create encrypted data",
          })
        }

        // Create the duplicate credential
        const newCredential = await tx.credential.create({
          data: {
            identifier: duplicateIdentifier,
            passwordEncryptionId:
              emptyPasswordEncryptionResult.encryptedData.id,
            status: originalCredential.status,
            platformId: originalCredential.platformId,
            description: originalCredential.description,
            userId: context.user.id,
            containerId: originalCredential.containerId,
            tags: {
              connect: originalCredential.tags.map((tag) => ({ id: tag.id })),
            },
          },
        })

        // Create metadata for the duplicated credential
        if (
          originalCredential.metadata &&
          originalCredential.metadata.length > 0
        ) {
          const originalMetadata = originalCredential.metadata[0]

          const newMetadata = await tx.credentialMetadata.create({
            data: {
              credentialId: newCredential.id,
              has2FA: originalMetadata.has2FA,
              recoveryEmail: originalMetadata.recoveryEmail,
              phoneNumber: originalMetadata.phoneNumber,
              keyValuePairs: {
                create: await Promise.all(
                  originalKeyValuePairs.map(async (kvPair) => {
                    // Create empty encrypted data for key-value pair (user will set new value)
                    const emptyValueEncryptionResult =
                      await createEncryptedData(
                        {
                          encryptedValue: "", // Empty value
                          encryptionKey: kvPair.valueEncryption.encryptionKey, // Use same key
                          iv: kvPair.valueEncryption.iv, // Use same IV
                        },
                        tx
                      )

                    if (
                      !emptyValueEncryptionResult.success ||
                      !emptyValueEncryptionResult.encryptedData
                    ) {
                      throw new ORPCError("INTERNAL_SERVER_ERROR", {
                        message:
                          emptyValueEncryptionResult.error ??
                          "Failed to create encrypted data for duplicated key-value pair",
                      })
                    }

                    return {
                      key: kvPair.key,
                      valueEncryption: {
                        connect: {
                          id: emptyValueEncryptionResult.encryptedData.id,
                        },
                      },
                    }
                  })
                ),
              },
            },
          })

          // Update the credential with metadata reference
          await tx.credential.update({
            where: { id: newCredential.id },
            data: { metadata: { connect: { id: newMetadata.id } } },
          })
        }

        return newCredential
      })

      return CredentialEntity.getSimpleRo(duplicatedCredential)
    } catch (error) {
      // Handle unique constraint violation
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ORPCError("CONFLICT", {
          message:
            "A credential with this identifier already exists for this platform",
        })
      }
      throw error
    }
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
  duplicate: duplicateCredential,
  delete: deleteCredential,
}
