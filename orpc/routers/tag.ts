import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  createTagInputSchema,
  deleteTagInputSchema,
  getTagInputSchema,
  listTagsInputSchema,
  listTagsOutputSchema,
  tagOutputSchema,
  updateTagInputSchema,
  type ListTagsOutput,
  type TagOutput,
} from "@/schemas/utils/dto"
import { ORPCError, os } from "@orpc/server"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// List tags with pagination
export const listTags = authProcedure
  .input(listTagsInputSchema)
  .output(listTagsOutputSchema)
  .handler(async ({ input, context }): Promise<ListTagsOutput> => {
    const { page, limit, search, containerId } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    }

    const [tags, total] = await Promise.all([
      database.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      database.tag.count({ where }),
    ])

    return {
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        userId: tag.userId,
        containerId: tag.containerId,
      })),
      total,
      hasMore: skip + tags.length < total,
      page,
      limit,
    }
  })

// Export the tag router
export const tagRouter = {
  list: listTags,
}
