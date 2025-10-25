import crypto from "crypto"
import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"
import { headers } from "next/headers"

import { env } from "@/env"

import type { ORPCContext } from "@/orpc/types"

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
      console.error("Webhook signature verification failed: Missing X-Signature header")
      throw new ORPCError("UNAUTHORIZED", { message: "Missing X-Signature header" })
    }

    // Get the raw request body for signature verification
    const request = context.request
    if (!request) {
      console.error("Webhook signature verification failed: No request object in context")
      throw new ORPCError("INTERNAL_SERVER_ERROR", {message: "No request object in context"})
    }

    const payload = await request.text()
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex")

    // Verify signature using timing-safe comparison
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    )

    if (!isValidSignature) {
      console.error("Webhook signature verification failed: Invalid signature")
      throw new ORPCError("UNAUTHORIZED", { message: "Invalid signature" })
    }

    console.log("Webhook signature verification successful")
    return next({ context })
  } catch (error) {
    // Re-throw ORPC errors to let oRPC handle them
    if (error instanceof ORPCError) {
      throw error
    }

    console.error("Webhook signature verification error:", error)
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Internal server error" })
  }
}