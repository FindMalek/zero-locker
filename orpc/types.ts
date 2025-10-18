import type { Session, User } from "better-auth/types"

export interface PermissionContext {
  isNormalUser: boolean
  canOnlyAccessDefaultContainers: boolean
}

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: number
}

export interface ORPCContext {
  session: Session | null
  user: User | null
  permissions?: PermissionContext
  /**
   * IP address of the request
   * Used for rate limiting and security logging
   */
  ip: string
  /**
   * User agent string from the request
   * Used for analytics and security logging
   */
  userAgent: string
  /**
   * Rate limit information for the current request
   * Available after rate limiting middleware is applied
   */
  rateLimit?: RateLimitInfo
}

export interface AuthenticatedContext extends ORPCContext {
  session: Session
  user: User
}

export type PublicContext = ORPCContext
