import { UserPlan } from "@prisma/client"

import type { PermissionConfig } from "./types"
import { Action, Feature, PermissionLevel } from "./types"

/**
 * Permission utility functions
 * Pure functions for permission checking and validation
 */

/**
 * Get permission configuration for a user plan
 */
export function getPermissionConfig(plan: UserPlan): PermissionConfig {
  switch (plan) {
    case UserPlan.PRO:
      return {
        plan,
        features: {
          containers: {
            create: true,
            update: true,
            delete: true,
            unlimited: true,
            maxCount: Infinity,
          },
        },
      }

    case UserPlan.NORMAL:
    default:
      return {
        plan,
        features: {
          containers: {
            create: false,
            update: false,
            delete: false,
            unlimited: false,
            maxCount: 3,
          },
        },
      }
  }
}

/**
 * Check if user has the required permission level for a specific feature
 *
 * This function implements a hierarchical permission system where higher levels
 * automatically include lower levels (ADMIN > WRITE > READ > NONE).
 *
 * @param userPlan - The user's subscription plan (NORMAL or PRO)
 * @param feature - The feature to check permissions for
 * @param requiredLevel - The minimum permission level required
 * @returns true if user has the required permission level or higher, false otherwise
 *
 * @example
 * ```typescript
 * // Check if user can read containers
 * const canRead = hasPermission(UserPlan.NORMAL, Feature.CONTAINERS, PermissionLevel.READ)
 *
 * // Check if user can create containers
 * const canCreate = hasPermission(UserPlan.PRO, Feature.CONTAINERS, PermissionLevel.WRITE)
 *
 * // Check if user can manage all containers
 * const canAdmin = hasPermission(UserPlan.PRO, Feature.CONTAINERS, PermissionLevel.ADMIN)
 * ```
 */
export function hasPermission(
  userPlan: UserPlan,
  feature: Feature,
  requiredLevel: PermissionLevel
): boolean {
  // Get user's permission level for the specific feature
  const userLevel = getUserPermissionLevel(userPlan, feature)

  // Check if user's level meets or exceeds required level
  return isPermissionLevelSufficient(userLevel, requiredLevel)
}

/**
 * Get the user's permission level for a specific feature based on their plan
 *
 * @param userPlan - The user's subscription plan
 * @param feature - The feature to check
 * @returns The user's permission level for the feature
 */
function getUserPermissionLevel(
  userPlan: UserPlan,
  feature: Feature
): PermissionLevel {
  switch (feature) {
    case Feature.CONTAINERS:
      switch (userPlan) {
        case UserPlan.PRO:
          return PermissionLevel.ADMIN // Full container management
        case UserPlan.NORMAL:
          return PermissionLevel.READ // Can view but not modify
        default:
          return PermissionLevel.NONE
      }

    case Feature.EXPORTS:
      switch (userPlan) {
        case UserPlan.PRO:
          return PermissionLevel.WRITE // Pro-only features
        case UserPlan.NORMAL:
          return PermissionLevel.NONE // Not available
        default:
          return PermissionLevel.NONE
      }

    case Feature.CREDENTIALS:
      switch (userPlan) {
        case UserPlan.PRO:
          return PermissionLevel.WRITE // Pro users can create credentials
        case UserPlan.NORMAL:
          return PermissionLevel.NONE // Not available
        default:
          return PermissionLevel.NONE
      }

    default:
      return PermissionLevel.NONE
  }
}

/**
 * Check if a permission level is sufficient for the required level
 *
 * Permission hierarchy: ADMIN > WRITE > READ > NONE
 * Higher levels automatically include lower level permissions.
 *
 * @param userLevel - The user's current permission level
 * @param requiredLevel - The minimum required permission level
 * @returns true if user level is sufficient, false otherwise
 */
function isPermissionLevelSufficient(
  userLevel: PermissionLevel,
  requiredLevel: PermissionLevel
): boolean {
  const levelHierarchy = {
    [PermissionLevel.NONE]: 0,
    [PermissionLevel.READ]: 1,
    [PermissionLevel.WRITE]: 2,
    [PermissionLevel.ADMIN]: 3,
  }

  return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel]
}

/**
 * Get user-friendly upgrade message for a specific feature
 *
 * Provides standardized messaging for upgrade prompts across the application.
 *
 * @param feature - The feature to get upgrade message for
 * @returns Object containing title and description for the upgrade prompt
 *
 * @example
 * ```typescript
 * const message = getUpgradeMessage(Feature.CONTAINERS)
 * // Returns: { title: "You can only use Containers on a Pro plan", description: "and above. Upgrade to Pro to continue." }
 * ```
 */
export function getUpgradeMessage(feature: Feature): {
  title: string
  description: string
} {
  const messages: Record<Feature, { title: string; description: string }> = {
    [Feature.CONTAINERS]: {
      title: "You can only use Containers on a Pro plan",
      description: "and above. Upgrade to Pro to continue.",
    },
    [Feature.EXPORTS]: {
      title: "Data exports require a Pro plan",
      description: "Upgrade to export your data in various formats.",
    },
    [Feature.CREDENTIALS]: {
      title: "You can only use Credentials on a Pro plan",
      description: "and above. Upgrade to Pro to continue.",
    },
  }

  return (
    messages[feature] || {
      title: "This feature requires a Pro plan",
      description: "Upgrade to unlock advanced features.",
    }
  )
}

/**
 * Check if user can perform a specific action based on their plan and current resource count
 *
 * This function considers both permission levels and resource limits (e.g., container count limits).
 *
 * @param userPlan - The user's subscription plan
 * @param currentCount - Current number of resources the user has (not used for READ actions)
 * @param action - The action to check (Action.READ, Action.CREATE, Action.UPDATE, or Action.DELETE)
 * @returns true if the user can perform the action, false otherwise
 *
 * @example
 * ```typescript
 * // Check if user can read containers (available to all plans)
 * const canRead = canPerformAction(UserPlan.NORMAL, 0, Action.READ) // true
 *
 * // Check if normal user can create another container (max 3)
 * const canCreate = canPerformAction(UserPlan.NORMAL, 2, Action.CREATE) // true
 * const canCreateMore = canPerformAction(UserPlan.NORMAL, 3, Action.CREATE) // false
 *
 * // Check if user can update containers
 * const canUpdate = canPerformAction(UserPlan.PRO, 5, Action.UPDATE) // true
 * ```
 */
export function canPerformAction(
  userPlan: UserPlan,
  currentCount: number,
  action: Action
): boolean {
  const config = getPermissionConfig(userPlan)

  switch (action) {
    case Action.READ:
      return hasPermission(userPlan, Feature.CONTAINERS, PermissionLevel.READ)
    case Action.CREATE:
      return (
        config.features.containers.create &&
        (config.features.containers.unlimited ||
          currentCount < config.features.containers.maxCount)
      )
    case Action.UPDATE:
      return config.features.containers.update
    case Action.DELETE:
      return config.features.containers.delete
    default:
      return false
  }
}
