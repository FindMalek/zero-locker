import type { Session, User } from "better-auth/types"

export interface PermissionContext {
  isNormalUser: boolean
  canOnlyAccessDefaultContainers: boolean
}

export interface ORPCContext {
  session: Session | null
  user: User | null
  permissions?: PermissionContext
}

export interface AuthenticatedContext extends ORPCContext {
  session: Session
  user: User
}

export type PublicContext = ORPCContext
