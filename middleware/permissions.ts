import type { ORPCContext } from "@/orpc/types"
import { database } from "@/prisma/client"
import { ORPCError } from "@orpc/server"
import { UserPlan } from "@prisma/client"

import {
  Action,
  canPerformAction,
  Feature,
  hasPermission,
  PermissionLevel,
} from "@/lib/permissions"

/**
 * Permission middleware for oRPC routes
 * Validates user permissions before allowing access to protected endpoints
 */

interface PermissionMiddlewareOptions {
  feature: Feature
  level: PermissionLevel
  checkResourceCount?: {
    action: Action
    getCurrentCount?: (userId: string) => Promise<number>
  }
}

/**
 * Creates a permission middleware that checks if user has required permissions
 *
 * @param options - Permission configuration
 * @returns Middleware function for oRPC
 *
 * @example
 * ```typescript
 * // Require WRITE level for container creation
 * const createContainer = authProcedure
 *   .use(requirePermission({
 *     feature: Feature.CONTAINERS,
 *     level: PermissionLevel.WRITE,
 *     checkResourceCount: { action: Action.CREATE, getCurrentCount: getContainerCount }
 *   }))
 *   .handler(...)
 * ```
 */
export function requirePermission(options: PermissionMiddlewareOptions) {
  return async ({
    context,
    next,
  }: {
    context: ORPCContext
    next: Function
  }) => {
    // Ensure user is authenticated (should be handled by authMiddleware first)
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Authentication required",
      })
    }

    // Get user's plan from database (could be cached in future)
    const user = await database.user.findUnique({
      where: { id: context.user.id },
      select: { plan: true },
    })

    if (!user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "User not found",
      })
    }

    // Check basic permission level
    const hasRequiredPermission = hasPermission(
      user.plan,
      options.feature,
      options.level
    )

    if (!hasRequiredPermission) {
      throw new ORPCError("FORBIDDEN", {
        message: `Insufficient permissions for ${options.feature}. ${getPlanUpgradeMessage(user.plan, options.feature)}`,
      })
    }

    // Check resource count limits if specified
    if (options.checkResourceCount) {
      const { action, getCurrentCount } = options.checkResourceCount

      if (getCurrentCount && action === Action.CREATE) {
        const currentCount = await getCurrentCount(context.user.id)
        const canPerform = canPerformAction(user.plan, currentCount, action)

        if (!canPerform) {
          throw new ORPCError("FORBIDDEN", {
            message: `Resource limit reached. ${getPlanUpgradeMessage(user.plan, options.feature)}`,
          })
        }
      }
    }

    return next({ context })
  }
}

/**
 * Convenience middleware for container permissions
 */
export const requireContainerPermission = (
  level: PermissionLevel,
  action?: Action
) => {
  return requirePermission({
    feature: Feature.CONTAINERS,
    level,
    ...(action === Action.CREATE && {
      checkResourceCount: {
        action: Action.CREATE,
        getCurrentCount: async (userId: string) => {
          return await database.container.count({
            where: { userId, isDefault: false }, // Only count non-default containers
          })
        },
      },
    }),
  })
}

/**
 * Get upgrade message for insufficient permissions
 */
function getPlanUpgradeMessage(userPlan: UserPlan, feature: Feature): string {
  if (userPlan === UserPlan.NORMAL) {
    switch (feature) {
      case Feature.CONTAINERS:
        return "Upgrade to Pro to create unlimited containers."
      case Feature.EXPORTS:
        return "Upgrade to Pro to export your data."
    }
  }
  return ""
}

/**
 * Check if user can access default containers only (for Normal users)
 */
export function requireDefaultContainerAccess() {
  return async ({
    context,
    next,
  }: {
    context: ORPCContext
    next: Function
  }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED")
    }

    const user = await database.user.findUnique({
      where: { id: context.user.id },
      select: { plan: true },
    })

    if (!user) {
      throw new ORPCError("UNAUTHORIZED")
    }

    // Normal users can only access default containers
    // This can be used in container list/get operations
    const isNormalUser = user.plan === UserPlan.NORMAL

    const mergedPermissions = {
      ...(context.permissions || {}),
      isNormalUser,
      canOnlyAccessDefaultContainers: isNormalUser,
    }

    return next({
      context: {
        ...context,
        permissions: mergedPermissions,
      },
    })
  }
}
