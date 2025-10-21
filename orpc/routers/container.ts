import { ContainerEntity } from "@/entities/utils/container/entity"
import { authMiddleware } from "@/middleware/auth"
import {
  requireContainerPermission,
  requireDefaultContainerAccess,
} from "@/middleware/permissions"
import { database } from "@/prisma/client"
import {
  containersArrayOutputSchema,
  containerSimpleOutputSchema,
  createContainerInputSchema,
  deleteContainerInputSchema,
  emptyInputSchema,
  EntityTypeSchema,
  getContainerInputSchema,
  getDefaultContainerForEntityInputSchema,
  listContainersInputSchema,
  listContainersOutputSchema,
  updateContainerInputSchema,
  type ContainerSimpleOutput,
  type GetDefaultContainerForEntityInput,
  type ListContainersOutput,
} from "@/schemas/utils"
import {
  createWithSecretsInputSchema,
  createWithSecretsOutputSchema,
  type CreateWithSecretsInput,
  type CreateWithSecretsOutput,
} from "@/schemas/utils/container/with-secrets"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"

import { Action, PermissionLevel } from "@/lib/permissions"
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

// Get container by ID
export const getContainer = authWithDefaultAccessProcedure
  .input(getContainerInputSchema)
  .output(containerSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerSimpleOutput> => {
    const container = await database.container.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
        ...(context.permissions?.canOnlyAccessDefaultContainers && {
          isDefault: true,
        }),
      },
    })

    if (!container) {
      throw new ORPCError("NOT_FOUND")
    }

    return ContainerEntity.getSimpleRo(container)
  })

// List containers with pagination
export const listContainers = authWithDefaultAccessProcedure
  .input(listContainersInputSchema)
  .output(listContainersOutputSchema)
  .handler(async ({ input, context }): Promise<ListContainersOutput> => {
    const { page, limit, search } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(context.permissions?.canOnlyAccessDefaultContainers && {
        isDefault: true,
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [containers, total] = await Promise.all([
      database.container.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.container.count({ where }),
    ])

    return {
      containers: containers.map((container) =>
        ContainerEntity.getSimpleRo(container)
      ),
      total,
      hasMore: skip + containers.length < total,
      page,
      limit,
    }
  })

// Create container
export const createContainer = authWithDefaultAccessProcedure
  .use(({ context, next }) =>
    requireContainerPermission(
      PermissionLevel.WRITE,
      Action.CREATE
    )({ context, next })
  )
  .input(createContainerInputSchema)
  .output(containerSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerSimpleOutput> => {
    if (context.permissions?.canOnlyAccessDefaultContainers) {
      throw new ORPCError("FORBIDDEN", {
        message: "Your plan only allows access to default containers.",
      })
    }

    const container = await database.$transaction(async (tx) => {
      const tagConnections = await createTagsAndGetConnections(
        input.tags,
        context.user.id,
        undefined,
        tx
      )

      return await tx.container.create({
        data: {
          name: input.name,
          icon: input.icon,
          description: input.description,
          type: input.type,
          userId: context.user.id,
          tags: tagConnections,
        },
      })
    })

    return ContainerEntity.getSimpleRo(container)
  })

// Update container
export const updateContainer = authWithDefaultAccessProcedure
  .use(({ context, next }) =>
    requireContainerPermission(PermissionLevel.WRITE)({ context, next })
  )
  .input(updateContainerInputSchema)
  .output(containerSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerSimpleOutput> => {
    const { id, ...updateData } = input

    // Verify container ownership
    const existingContainer = await database.container.findFirst({
      where: {
        id,
        userId: context.user.id,
        ...(context.permissions?.canOnlyAccessDefaultContainers && {
          isDefault: true,
        }),
      },
    })

    if (!existingContainer) {
      throw new ORPCError("NOT_FOUND")
    }

    // Process the update data
    const updatePayload: Prisma.ContainerUpdateInput = {}

    if (updateData.name !== undefined) updatePayload.name = updateData.name
    if (updateData.icon !== undefined) updatePayload.icon = updateData.icon
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description
    if (updateData.type !== undefined) updatePayload.type = updateData.type

    // Handle tags if provided
    if (updateData.tags !== undefined) {
      const tagConnections = await createTagsAndGetConnections(
        updateData.tags,
        context.user.id,
        undefined
      )
      updatePayload.tags = tagConnections
    }

    const updatedContainer = await database.container.update({
      where: { id },
      data: updatePayload,
    })

    return ContainerEntity.getSimpleRo(updatedContainer)
  })

// Delete container
export const deleteContainer = authWithDefaultAccessProcedure
  .use(({ context, next }) =>
    requireContainerPermission(PermissionLevel.ADMIN)({ context, next })
  )
  .input(deleteContainerInputSchema)
  .output(containerSimpleOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerSimpleOutput> => {
    // Verify container ownership
    const existingContainer = await database.container.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
        ...(context.permissions?.canOnlyAccessDefaultContainers && {
          isDefault: true,
        }),
      },
    })

    if (!existingContainer) {
      throw new ORPCError("NOT_FOUND")
    }

    const deletedContainer = await database.container.delete({
      where: { id: input.id },
    })

    return ContainerEntity.getSimpleRo(deletedContainer)
  })

// Create container with secrets
export const createContainerWithSecrets = authWithDefaultAccessProcedure
  .use(({ context, next }) =>
    requireContainerPermission(
      PermissionLevel.WRITE,
      Action.CREATE
    )({ context, next })
  )
  .input(createWithSecretsInputSchema)
  .output(createWithSecretsOutputSchema)
  .handler(async ({ input, context }): Promise<CreateWithSecretsOutput> => {
    if (context.permissions?.canOnlyAccessDefaultContainers) {
      throw new ORPCError("FORBIDDEN", {
        message: "Your plan only allows access to default containers.",
      })
    }

    const { container: containerData, secrets: secretsData } = input

    try {
      const result = await database.$transaction(async (tx) => {
        // Create container with tags
        const tagConnections = await createTagsAndGetConnections(
          containerData.tags,
          context.user.id,
          undefined,
          tx
        )

        const container = await tx.container.create({
          data: {
            name: containerData.name,
            icon: containerData.icon,
            description: containerData.description,
            type: containerData.type,
            userId: context.user.id,
            tags: tagConnections,
          },
        })

        // Create encrypted data and secrets
        const createdSecrets = []
        for (const secretData of secretsData) {
          // Use the helper function for consistency
          const encryptionResult = await createEncryptedData(
            {
              iv: secretData.valueEncryption.iv,
              encryptedValue: secretData.valueEncryption.encryptedValue,
              encryptionKey: secretData.valueEncryption.encryptionKey,
            },
            tx
          )

          if (!encryptionResult.success || !encryptionResult.encryptedData) {
            throw new ORPCError("INTERNAL_SERVER_ERROR")
          }

          // Create secret
          const secret = await tx.secret.create({
            data: {
              name: secretData.name,
              note: secretData.note,
              userId: context.user.id,
              containerId: container.id,
              valueEncryptionId: encryptionResult.encryptedData.id,
            },
          })

          createdSecrets.push(secret)
        }

        return { container, createdSecrets }
      })

      return {
        success: true,
        container: ContainerEntity.getSimpleRo(result.container),
        secrets: result.createdSecrets.map((secret) => ({
          id: secret.id,
          name: secret.name,
          note: secret.note,
          lastViewed: secret.lastViewed,
          updatedAt: secret.updatedAt,
          createdAt: secret.createdAt,
          userId: secret.userId,
          containerId: secret.containerId,
          valueEncryptionId: secret.valueEncryptionId,
        })),
      }
    } catch (error) {
      console.error("Error creating container with secrets:", error)

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
  })

// Get default container for a specific entity type
export const getDefaultContainerForEntity = authProcedure
  .input(getDefaultContainerForEntityInputSchema)
  .output(containerSimpleOutputSchema.nullable())
  .handler(
    async ({ input, context }): Promise<ContainerSimpleOutput | null> => {
      const containerType = ContainerEntity.getDefaultContainerTypeForEntity(
        input.entityType
      )

      const container = await database.container.findFirst({
        where: {
          userId: context.user.id,
          isDefault: true,
          type: containerType,
        },
      })

      return container ? ContainerEntity.getSimpleRo(container) : null
    }
  )

// Get all default containers for a user
export const getUserDefaultContainers = authProcedure
  .input(emptyInputSchema)
  .output(containersArrayOutputSchema)
  .handler(async ({ context }): Promise<ContainerSimpleOutput[]> => {
    const containers = await database.container.findMany({
      where: {
        userId: context.user.id,
        isDefault: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return containers.map((container) => ContainerEntity.getSimpleRo(container))
  })

// Export the container router
export const containerRouter = {
  get: getContainer,
  list: listContainers,
  create: createContainer,
  update: updateContainer,
  delete: deleteContainer,
  createWithSecrets: createContainerWithSecrets,
  getDefaultForEntity: getDefaultContainerForEntity,
  getUserDefaults: getUserDefaultContainers,
}
