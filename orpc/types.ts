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
   * Rate limit information for the current request
   * Available after rate limiting middleware is applied
   */
  rateLimit?: RateLimitInfo
  /**
   * Raw request object for webhook signature verification
   * Available for webhook routes that need to verify signatures
   */
  request?: Request
  /**
   * Parsed request body
   * Available for webhook routes that need to access the raw body
   */
  body?: unknown
}

export interface AuthenticatedContext extends ORPCContext {
  session: Session
  user: User
}

export type PublicContext = ORPCContext
