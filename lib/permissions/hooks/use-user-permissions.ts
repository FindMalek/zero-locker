import { useCurrentUser } from "@/orpc/hooks/use-users"
import { UserPlan } from "@prisma/client"

import { getPermissionConfig } from "../utils"

/**
 * Custom hook that centralizes user permission logic
 * This follows the single responsibility principle and makes permissions
 * easily testable and reusable across components
 */
export function useUserPermissions() {
  const { data: currentUser } = useCurrentUser()

  // Handle loading state - if no user data, use normal user plan as default
  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const config = getPermissionConfig(userPlan)

  const isNormalUser = config.plan === UserPlan.NORMAL
  const isProUser = config.plan === UserPlan.PRO

  return {
    // User type checks
    isNormalUser,
    isProUser,

    // Feature permissions - all derived from canonical config
    canCreateContainers: config.features.containers.create,
    canSelectContainers: config.features.containers.create, // Allow selection if can create
    canDeleteContainers: config.features.containers.delete,
    canUpdateContainers: config.features.containers.update,

    // Container limits - all derived from canonical config
    hasUnlimitedContainers: config.features.containers.unlimited,
    maxContainers: config.features.containers.maxCount,

    // UI behavior - derived from plan type
    shouldShowUpgradePrompts: isNormalUser,
    shouldPreSelectDefaultContainer: isNormalUser,
  }
}

export type { UseUserPermissionsReturn } from "../types"
