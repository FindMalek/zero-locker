import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"

import type { PublicContext } from "@/orpc/types"
import {
  checkRateLimit,
  RATE_LIMIT_PRESETS,
  type RateLimitConfig,
} from "@/lib/utils/rate-limit"

/**
 * Rate limiting middleware for oRPC
 *
 * This middleware applies IP-based rate limiting to protect against abuse and DoS attacks.
 * It should be applied to public endpoints that don't require authentication.
 *
 * @example
 * ```ts
 * const publicProcedure = baseProcedure
 *   .use(rateLimitMiddleware({ maxRequests: 30, windowSeconds: 60 }))
 *
 * export const getPublicData = publicProcedure
 *   .handler(async () => {
 *     // Handler implementation
 *   })
 * ```
 */
export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return async ({
    context,
    next,
  }: {
    context: PublicContext
    next: MiddlewareNextFn<unknown>
  }) => {
    const ip = context.ip

    // Check rate limit for this IP
    const result = await checkRateLimit(ip, config)

    // Log rate limit checks in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Rate Limit] IP: ${ip}, Remaining: ${result.remaining}/${result.limit}`)
    }

    if (!result.allowed) {
      // Log rate limit violations
      console.warn(
        `[Rate Limit] IP ${ip} exceeded rate limit (${config.identifier || "default"}). Retry after ${result.retryAfter}s`
      )

      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "Rate limit exceeded. Please try again later.",
        data: {
          retryAfter: result.retryAfter,
          limit: result.limit,
          resetAt: result.resetAt,
        },
      })
    }

    // Continue to the next middleware with rate limit info in context
    return next({
      context: {
        ...context,
        rateLimit: {
          remaining: result.remaining,
          limit: result.limit,
          resetAt: result.resetAt,
        },
      },
    })
  }
}

/**
 * Predefined rate limit middleware configurations
 */

/**
 * Strict rate limit - for sensitive endpoints (e.g., password reset, email sending)
 * 5 requests per minute
 */
export const strictRateLimit = () => {
  return rateLimitMiddleware({
    ...RATE_LIMIT_PRESETS.STRICT,
    identifier: "strict",
  })
}

/**
 * Moderate rate limit - for general public endpoints (default)
 * 30 requests per minute
 */
export const moderateRateLimit = () => {
  return rateLimitMiddleware({
    ...RATE_LIMIT_PRESETS.MODERATE,
    identifier: "moderate",
  })
}

/**
 * Lenient rate limit - for high-traffic public endpoints
 * 100 requests per minute
 */
export const lenientRateLimit = () => {
  return rateLimitMiddleware({
    ...RATE_LIMIT_PRESETS.LENIENT,
    identifier: "lenient",
  })
}

/**
 * Very lenient rate limit - for static content or health checks
 * 300 requests per minute
 */
export const veryLenientRateLimit = () => {
  return rateLimitMiddleware({
    ...RATE_LIMIT_PRESETS.VERY_LENIENT,
    identifier: "very-lenient",
  })
}

