export { useUserPermissions } from "./hooks/use-user-permissions"

export {
  getPermissionConfig,
  hasPermission,
  getUpgradeMessage,
  canPerformAction,
} from "./utils"

export type { UserPermissionFlags, UseUserPermissionsReturn, PermissionConfig, FeatureFlags } from "./types"

export { PermissionLevel, Feature, Action } from "./types"
