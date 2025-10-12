import { ORPCContext } from "@/orpc/types"
import { MiddlewareNextFn, ORPCError } from "@orpc/server"

interface RateLimitStore {
  count: number
  resetTime: number
}

// Simple in-memory rate limiter
// In production, consider using Redis or a similar solution
const rateLimitStore = new Map<string, RateLimitStore>()

interface RateLimitOptions {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  keyPrefix?: string // Prefix for the rate limit key
}

/**
 * Creates a rate limiting middleware for oRPC routes
 * @param options - Rate limiting configuration
 * @returns Middleware function for oRPC
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { maxRequests, windowMs, keyPrefix = "ratelimit" } = options

  return async ({ context, next }: { context: ORPCContext; next: MiddlewareNextFn<unknown> }) => {
    // Try to get IP address from various sources
    const ip =
      context.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      context.headers?.["x-real-ip"] ||
      context.ip ||
      "unknown"

    const key = `${keyPrefix}:${ip}`
    const now = Date.now()

    // Get or create rate limit entry
    let rateLimitEntry = rateLimitStore.get(key)

    // Reset if window has expired
    if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
      rateLimitEntry = {
        count: 0,
        resetTime: now + windowMs,
      }
    }

    // Increment request count
    rateLimitEntry.count += 1
    rateLimitStore.set(key, rateLimitEntry)

    // Check if rate limit exceeded
    if (rateLimitEntry.count > maxRequests) {
      const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000)

      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Too many requests. Please try again later.",
        data: { retryAfter },
      })
    }

    // Clean up expired entries periodically (every 100 requests)
    if (Math.random() < 0.01) {
      cleanupExpiredEntries()
    }

    return next({ context })
  }
}

/**
 * Cleanup expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  const keysToDelete: string[] = []

  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  })

  keysToDelete.forEach((key) => rateLimitStore.delete(key))
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limiter for sensitive public endpoints (e.g., waitlist, subscriptions)
  strict: createRateLimiter({
    maxRequests: 5, // 5 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyPrefix: "strict",
  }),

  // Moderate rate limiter for general public endpoints
  moderate: createRateLimiter({
    maxRequests: 20, // 20 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyPrefix: "moderate",
  }),

  // Lenient rate limiter for low-risk endpoints
  lenient: createRateLimiter({
    maxRequests: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyPrefix: "lenient",
  }),
}

/**
 * Get current rate limit stats for debugging (optional)
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, value]) => ({
      key,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString(),
    })),
  }
}

