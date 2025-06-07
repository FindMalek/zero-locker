"use server"

import { ContainerEntity, ContainerQuery } from "@/entities/utils/container"
import { database } from "@/prisma/client"
import {
  ContainerDto,
  containerDtoSchema,
  ContainerSimpleRo,
  DeleteContainerDto,
  deleteContainerDtoSchema,
  GetContainerByIdDto,
  getContainerByIdDtoSchema,
  UpdateContainerDto,
  updateContainerDtoSchema,
} from "@/schemas/utils/container"
import { ContainerType } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Checks if container supports environment operations (only secrets-only or mixed with secrets)
 */
export async function containerSupportsEnvOperations(
  containerId: string
): Promise<{
  success: boolean
  supports?: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    const container = await database.container.findFirst({
      where: {
        id: containerId,
        userId: session.user.id,
      },
      include: ContainerQuery.getSecretsInclude(),
    })

    if (!container) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    if (container.type === ContainerType.SECRETS_ONLY) {
      return {
        success: true,
        supports: true,
      }
    }

    if (
      container.type === ContainerType.MIXED &&
      container.secrets.length > 0
    ) {
      return {
        success: true,
        supports: true,
      }
    }

    return {
      success: true,
      supports: false,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    return {
      success: false,
      error: "Failed to check container",
    }
  }
}

/**
 * Get container by ID (Simple RO)
 */
export async function getSimpleContainerById(id: string): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const container = await database.container.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!container) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    return {
      success: true,
      container: ContainerEntity.getSimpleRo(container),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get simple container error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get container by ID (Full RO with relations)
 * @todo: Please implement the logic for the full-ro
 */
export async function getContainerById(data: GetContainerByIdDto): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getContainerByIdDtoSchema.parse(data)

    const result = await getSimpleContainerById(validatedData.id)
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Get container error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new container
 */
export async function createContainer(data: ContainerDto): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = containerDtoSchema.parse(data)

    try {
      // Extract tags from validatedData
      const { tags, ...containerData } = validatedData

      // Create container with Prisma
      const container = await database.container.create({
        data: {
          ...containerData,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(tags &&
            tags.length > 0 && {
              tags: {
                create: tags,
              },
            }),
        },
      })

      return {
        success: true,
        container: ContainerEntity.getSimpleRo(container),
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

    console.error("Container creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a container
 */
export async function updateContainer(data: UpdateContainerDto): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = updateContainerDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleContainerById to check if container exists and belongs to user
    const existingContainerResult = await getSimpleContainerById(id)
    if (!existingContainerResult.success) {
      return existingContainerResult
    }

    // Validate using our DTO schema (partial)
    const partialContainerSchema = containerDtoSchema.partial()
    const validatedUpdateData = partialContainerSchema.parse(updateData)

    try {
      // Extract tags from validatedUpdateData
      const { tags, ...containerUpdateData } = validatedUpdateData

      // Update container with Prisma
      const updatedContainer = await database.container.update({
        where: { id },
        data: {
          ...containerUpdateData,
          updatedAt: new Date(),
          ...(tags && {
            tags: {
              deleteMany: {},
              create: tags,
            },
          }),
        },
      })

      return {
        success: true,
        container: ContainerEntity.getSimpleRo(updatedContainer),
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

    console.error("Container update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a container
 */
export async function deleteContainer(data: DeleteContainerDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = deleteContainerDtoSchema.parse(data)

    // Use getSimpleContainerById to check if container exists and belongs to user
    const existingContainerResult = await getSimpleContainerById(
      validatedData.id
    )
    if (!existingContainerResult.success) {
      return {
        success: false,
        error: existingContainerResult.error,
      }
    }

    // Check if container has any entities before deletion
    const [credentialCount, secretCount, cardCount] = await Promise.all([
      database.credential.count({
        where: { containerId: validatedData.id },
      }),
      database.secret.count({
        where: { containerId: validatedData.id },
      }),
      database.card.count({
        where: { containerId: validatedData.id },
      }),
    ])

    if (credentialCount > 0 || secretCount > 0 || cardCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete container with existing entities. Please move or delete all entities first.",
      }
    }

    await database.container.delete({
      where: { id: validatedData.id },
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

    console.error("Container deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List containers with pagination
 */
export async function listContainers(
  page = 1,
  limit = 10
): Promise<{
  success: boolean
  containers?: ContainerSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()
    const skip = (page - 1) * limit

    const [containers, total] = await Promise.all([
      database.container.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.container.count({
        where: { userId: session.user.id },
      }),
    ])

    return {
      success: true,
      containers: containers.map((container) =>
        ContainerEntity.getSimpleRo(container)
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
    console.error("List containers error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get container statistics
 */
export async function getContainerStats(id: string): Promise<{
  success: boolean
  stats?: {
    credentialCount: number
    secretCount: number
    cardCount: number
    tagCount: number
  }
  error?: string
}> {
  try {
    const session = await verifySession()

    // Use getSimpleContainerById to check if container exists and belongs to user
    const containerResult = await getSimpleContainerById(id)
    if (!containerResult.success) {
      return containerResult
    }

    const [credentialCount, secretCount, cardCount, tagCount] =
      await Promise.all([
        database.credential.count({
          where: { containerId: id },
        }),
        database.secret.count({
          where: { containerId: id },
        }),
        database.card.count({
          where: { containerId: id },
        }),
        database.tag.count({
          where: { containerId: id },
        }),
      ])

    return {
      success: true,
      stats: {
        credentialCount,
        secretCount,
        cardCount,
        tagCount,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get container stats error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
