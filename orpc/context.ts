import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

import type { ORPCContext } from "./types"

/**
 * Extract IP address from request headers
 * Handles various proxy configurations (Vercel, CloudFlare, etc.)
 *
 * SECURITY: Headers are checked in order of trustworthiness to prevent IP spoofing.
 * This is critical for rate limiting, as attackers could bypass limits by spoofing IPs.
 */
function getClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const vercelIp = headersList.get("x-vercel-forwarded-for")
  const cfConnectingIp = headersList.get("cf-connecting-ip")

  // CloudFlare-specific header (most trusted)
  // Set by CloudFlare, cannot be spoofed when behind CF
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Vercel-specific header (trusted on Vercel platform)
  // Set by Vercel, cannot be spoofed on Vercel platform
  if (vercelIp) {
    const ips = vercelIp.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // X-Real-IP (set by some proxies)
  if (realIp) {
    return realIp
  }

  // X-Forwarded-For (least trusted, check last)
  // Can be spoofed by clients if not behind a trusted proxy
  // Can contain multiple IPs (client, proxy1, proxy2, ...)
  // The first IP is the original client
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Default fallback for local development
  return "UNKNOWN-IP"
}

export async function createContext(request?: Request): Promise<ORPCContext> {
  try {
    const headersList = await headers()
    const ip = getClientIp(headersList)

    const authResult = await auth.api.getSession({
      headers: headersList,
    })

    return {
      session: authResult?.session || null,
      user: authResult?.user || null,
      ip,
      request,
    }
  } catch (error) {
    console.error("Failed to get session:", error)
    return {
      session: null,
      user: null,
      ip: "UNKNOWN-IP",
      request,
    }
  }
}
