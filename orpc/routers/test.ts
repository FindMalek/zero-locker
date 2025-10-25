import type { ORPCContext } from "@/orpc/types"
import { ORPCError, os } from "@orpc/server"
import { z } from "zod"

import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit"

const baseProcedure = os.$context<ORPCContext>()

const testRateLimitInputSchema = z.object({
  endpoint: z.enum(["strict", "moderate"]),
  timestamp: z.string(),
})

const testRateLimitOutputSchema = z.object({
  success: z.boolean(),
  remaining: z.number(),
  limit: z.number(),
  resetAt: z.number(),
  endpoint: z.string(),
})

// Test endpoints with different rate limits
export const testStrictRateLimit = baseProcedure
  .input(testRateLimitInputSchema)
  .output(testRateLimitOutputSchema)
  .handler(
    async ({
      input,
      context,
    }): Promise<z.infer<typeof testRateLimitOutputSchema>> => {
      const result = await checkRateLimit(context.ip, {
        ...RATE_LIMIT_PRESETS.STRICT,
        identifier: "test-strict",
      })

      if (!result.allowed) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Rate limit exceeded. Please try again later.",
          data: {
            retryAfter: result.retryAfter,
            limit: result.limit,
            resetAt: result.resetAt,
          },
        })
      }

      return {
        success: true,
        remaining: result.remaining,
        limit: result.limit,
        resetAt: result.resetAt,
        endpoint: "strict",
      }
    }
  )

export const testModerateRateLimit = baseProcedure
  .input(testRateLimitInputSchema)
  .output(testRateLimitOutputSchema)
  .handler(
    async ({
      input,
      context,
    }): Promise<z.infer<typeof testRateLimitOutputSchema>> => {
      const result = await checkRateLimit(context.ip, {
        ...RATE_LIMIT_PRESETS.MODERATE,
        identifier: "test-moderate",
      })

      if (!result.allowed) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Rate limit exceeded. Please try again later.",
          data: {
            retryAfter: result.retryAfter,
            limit: result.limit,
            resetAt: result.resetAt,
          },
        })
      }

      return {
        success: true,
        remaining: result.remaining,
        limit: result.limit,
        resetAt: result.resetAt,
        endpoint: "moderate",
      }
    }
  )

// Unified test endpoint that routes to the appropriate handler
export const testRateLimit = baseProcedure
  .input(testRateLimitInputSchema)
  .output(testRateLimitOutputSchema)
  .handler(
    async ({
      input,
      context,
    }): Promise<z.infer<typeof testRateLimitOutputSchema>> => {
      if (input.endpoint === "strict") {
        const result = await checkRateLimit(context.ip, {
          maxRequests: 5,
          windowSeconds: 60,
          identifier: "test-strict",
        })

        if (!result.allowed) {
          throw new ORPCError("TOO_MANY_REQUESTS", {
            message: "Rate limit exceeded. Please try again later.",
            data: {
              retryAfter: result.retryAfter,
              limit: result.limit,
              resetAt: result.resetAt,
            },
          })
        }

        return {
          success: true,
          remaining: result.remaining,
          limit: result.limit,
          resetAt: result.resetAt,
          endpoint: "strict",
        }
      } else {
        const result = await checkRateLimit(context.ip, {
          maxRequests: 30,
          windowSeconds: 60,
          identifier: "test-moderate",
        })

        if (!result.allowed) {
          throw new ORPCError("TOO_MANY_REQUESTS", {
            message: "Rate limit exceeded. Please try again later.",
            data: {
              retryAfter: result.retryAfter,
              limit: result.limit,
              resetAt: result.resetAt,
            },
          })
        }

        return {
          success: true,
          remaining: result.remaining,
          limit: result.limit,
          resetAt: result.resetAt,
          endpoint: "moderate",
        }
      }
    }
  )

export const testRouter = {
  testRateLimit,
  testStrictRateLimit,
  testModerateRateLimit,
}
