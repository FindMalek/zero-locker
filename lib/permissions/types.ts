import { UserPlan } from "@prisma/client"

/**
 * Core permission types and interfaces
 * Centralized location for all permission-related type definitions
 */

export interface UserPermissions {
  // User type checks
  isNormalUser: boolean
  isProUser: boolean

  // Feature permissions
  canCreateContainers: boolean
  canSelectContainers: boolean
  canDeleteContainers: boolean
  canUpdateContainers: boolean

  // Container limits
  hasUnlimitedContainers: boolean
  maxContainers: number

  // UI behavior
  shouldShowUpgradePrompts: boolean
  shouldPreSelectDefaultContainer: boolean
}

export interface PermissionConfig {
  plan: UserPlan
  features: {
    containers: {
      create: boolean
      update: boolean
      delete: boolean
      unlimited: boolean
      maxCount: number
    }
    // Future features can be added here
    // advancedSecurity: boolean
    // apiAccess: boolean
    // teamSharing: boolean
  }
}

// Permission levels enum for future extensibility
export enum PermissionLevel {
  NONE = "none",
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

// Features enum for type safety and scalability
export enum Feature {
  CONTAINERS = "containers",
  EXPORTS = "exports",
  CREDENTIALS = "credentials",
}

// Actions enum for consistent action types across the system
export enum Action {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

// Feature flags interface for future use
export interface FeatureFlags {
  advancedContainers: boolean
  bulkOperations: boolean
  apiAccess: boolean
  teamCollaboration: boolean
}
