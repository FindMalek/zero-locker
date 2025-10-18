import { strictRateLimiter } from "@/middleware"
import { os } from "@orpc/server"
import { z } from "zod"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()

// Test route with strict rate limiting (5 requests per minute)
const testRateLimitProcedure = baseProcedure.use(strictRateLimiter)

export const testRouter = {
  /**
   * Test endpoint for rate limiting
   * Rate limit: 5 requests per minute per IP
   */
  testRateLimit: testRateLimitProcedure
    .input(z.object({ message: z.string().optional() }))
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
        timestamp: z.number(),
        ip: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      return {
        success: true,
        message: input.message || "Rate limit test successful!",
        timestamp: Date.now(),
        ip: context.ip,
      }
    }),

  /**
   * Test endpoint to check current rate limit status
   */
  checkRateLimitStatus: baseProcedure
    .input(z.object({}))
    .output(
      z.object({
        ip: z.string().optional(),
        message: z.string(),
      })
    )
    .handler(async ({ context }) => {
      return {
        ip: context.ip,
        message: "This endpoint is not rate limited",
      }
    }),
}
