import { useCurrentUser } from "@/orpc/hooks/use-users"
import { UserPlan } from "@prisma/client"

/**
 * Custom hook that centralizes user permission logic
 * This follows the single responsibility principle and makes permissions
 * easily testable and reusable across components
 */
export function useUserPermissions() {
  const { data: currentUser } = useCurrentUser()

  // Handle loading state - if no user data, assume normal user for safety
  if (!currentUser) {
    return {
      isNormalUser: true,
      isProUser: false,
      canCreateContainers: false,
      canSelectContainers: false,
      canDeleteContainers: false,
      canUpdateContainers: false,
      hasUnlimitedContainers: false,
      maxContainers: 3,
      shouldShowUpgradePrompts: true,
      shouldPreSelectDefaultContainer: true,
    }
  }

  const isNormalUser = currentUser.plan === UserPlan.NORMAL
  const isProUser = currentUser.plan === UserPlan.PRO

  return {
    // User type checks
    isNormalUser,
    isProUser,

    // Feature permissions
    canCreateContainers: isProUser,
    canSelectContainers: isProUser,
    canDeleteContainers: isProUser,
    canUpdateContainers: isProUser,

    // Container limits
    hasUnlimitedContainers: isProUser,
    maxContainers: isNormalUser ? 3 : Infinity,

    // UI behavior
    shouldShowUpgradePrompts: isNormalUser,
    shouldPreSelectDefaultContainer: isNormalUser,
  }
}

export type UserPermissions = ReturnType<typeof useUserPermissions>
