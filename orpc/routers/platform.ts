import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  createPlatformInputSchema,
  deletePlatformInputSchema,
  getPlatformInputSchema,
  listPlatformsInputSchema,
  listPlatformsOutputSchema,
  platformOutputSchema,
  updatePlatformInputSchema,
  type ListPlatformsOutput,
  type PlatformOutput,
} from "@/schemas/utils"
import { ORPCError, os } from "@orpc/server"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// List platforms with pagination
export const listPlatforms = authProcedure
  .input(listPlatformsInputSchema)
  .output(listPlatformsOutputSchema)
  .handler(async ({ input, context }): Promise<ListPlatformsOutput> => {
    const { page, limit, search } = input
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { userId: context.user.id },
        { userId: null }, // Global platforms
      ],
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    }

    const [platforms, total] = await Promise.all([
      database.platform.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      database.platform.count({ where }),
    ])

    return {
      platforms: platforms.map((platform) => ({
        id: platform.id,
        name: platform.name,
        status: platform.status,
        logo: platform.logo,
        loginUrl: platform.loginUrl,
        updatedAt: platform.updatedAt,
        createdAt: platform.createdAt,
        userId: platform.userId,
      })),
      total,
      hasMore: skip + platforms.length < total,
      page,
      limit,
    }
  })

// Export the platform router
export const platformRouter = {
  list: listPlatforms,
}
