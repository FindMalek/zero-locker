import type { PublicContext } from "@/orpc/types"
import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>()

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000
)

export const createRateLimiter = (options: RateLimitOptions) => {
  const { maxRequests, windowMs } = options

  return async ({
    context,
    next,
  }: {
    context: PublicContext & { ip?: string }
    next: MiddlewareNextFn<unknown>
  }) => {
    // Get IP address from context
    const ip = context.ip || "unknown"

    // Get current rate limit state
    const now = Date.now()
    const rateLimitKey = `ratelimit:${ip}`
    let rateLimit = rateLimitStore.get(rateLimitKey)

    // Reset if window has expired
    if (!rateLimit || rateLimit.resetTime < now) {
      rateLimit = {
        count: 0,
        resetTime: now + windowMs,
      }
      rateLimitStore.set(rateLimitKey, rateLimit)
    }

    // Increment request count
    rateLimit.count++

    // Check if rate limit is exceeded
    if (rateLimit.count > maxRequests) {
      const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000)

      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        cause: {
          retryAfter,
          limit: maxRequests,
          windowMs,
        },
      })
    }

    return next({ context })
  }
}

// Pre-configured rate limiters for different use cases
export const strictRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
})

export const moderateRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
})

export const lenientRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
})
