import { headers } from "next/headers"
import type { ORPCContext } from "@/orpc/types"
import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"

import { env } from "@/env"

/**
 * Webhook signature verification middleware
 *
 * Verifies that webhook requests are legitimate by checking the X-Signature header
 * against the webhook secret using HMAC-SHA256.
 *
 * This middleware should be applied to webhook routes to ensure security.
 */
export const webhookSignatureMiddleware = async ({
  context,
  next,
}: {
  context: ORPCContext
  next: MiddlewareNextFn<unknown>
}) => {
  try {
    // Get headers from the request
    const headersList = await headers()
    const signature = headersList.get("x-signature")

    if (!signature) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Missing X-Signature header",
      })
    }

    if (signature !== env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Invalid X-Signature header",
      })
    }

    return next({ context })
  } catch (error) {
    // Re-throw ORPC errors to let oRPC handle them
    if (error instanceof ORPCError) {
      throw error
    }

    console.error("Webhook signature verification error:", error)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Internal server error",
    })
  }
}
