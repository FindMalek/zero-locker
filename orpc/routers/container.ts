import { ContainerEntity } from "@/entities/utils/container/entity"
import { database } from "@/prisma/client"
import {
  containerOutputSchema,
  createContainerInputSchema,
  deleteContainerInputSchema,
  getContainerInputSchema,
  listContainersInputSchema,
  listContainersOutputSchema,
  updateContainerInputSchema,
  type ContainerOutput,
  type ListContainersOutput,
} from "@/schemas/utils/dto"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"

import { createTagsAndGetConnections } from "@/actions/utils/tag"

import type { ORPCContext } from "../types"

// Base procedure with context
const baseProcedure = os.$context<ORPCContext>()

// Authenticated procedure
const authProcedure = baseProcedure.use(({ context, next }) => {
  if (!context.session || !context.user) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      ...context,
      session: context.session,
      user: context.user,
    },
  })
})

// Get container by ID
export const getContainer = authProcedure
  .input(getContainerInputSchema)
  .output(containerOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerOutput> => {
    const container = await database.container.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!container) {
      throw new ORPCError("NOT_FOUND")
    }

    return ContainerEntity.getSimpleRo(container)
  })

// List containers with pagination
export const listContainers = authProcedure
  .input(listContainersInputSchema)
  .output(listContainersOutputSchema)
  .handler(async ({ input, context }): Promise<ListContainersOutput> => {
    const { page, limit, search } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
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
export const createContainer = authProcedure
  .input(createContainerInputSchema)
  .output(containerOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerOutput> => {
    const tagConnections = await createTagsAndGetConnections(
      input.tags,
      context.user.id,
      undefined
    )

    const container = await database.container.create({
      data: {
        name: input.name,
        icon: input.icon,
        description: input.description,
        type: input.type,
        userId: context.user.id,
        tags: tagConnections,
      },
    })

    return ContainerEntity.getSimpleRo(container)
  })

// Update container
export const updateContainer = authProcedure
  .input(updateContainerInputSchema)
  .output(containerOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerOutput> => {
    const { id, ...updateData } = input

    // Verify container ownership
    const existingContainer = await database.container.findFirst({
      where: {
        id,
        userId: context.user.id,
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
export const deleteContainer = authProcedure
  .input(deleteContainerInputSchema)
  .output(containerOutputSchema)
  .handler(async ({ input, context }): Promise<ContainerOutput> => {
    // Verify container ownership
    const existingContainer = await database.container.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
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

// Export the container router
export const containerRouter = {
  get: getContainer,
  list: listContainers,
  create: createContainer,
  update: updateContainer,
  delete: deleteContainer,
}
