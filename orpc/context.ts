import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

import type { ORPCContext } from "./types"

/**
 * Extract IP address from request headers
 * Handles various proxy configurations (Vercel, CloudFlare, etc.)
 */
function getClientIp(headersList: Headers): string {
  // Try multiple headers in order of preference
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const vercelIp = headersList.get("x-vercel-forwarded-for")
  const cfConnectingIp = headersList.get("cf-connecting-ip")

  // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
  // The first IP is the original client
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Vercel-specific header
  if (vercelIp) {
    const ips = vercelIp.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // CloudFlare-specific header
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to X-Real-IP
  if (realIp) {
    return realIp
  }

  // Default fallback for local development
  return "UNKNOWN-IP"
}

export async function createContext(): Promise<ORPCContext> {
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
    }
  } catch (error) {
    console.error("Failed to get session:", error)
    return {
      session: null,
      user: null,
      ip: "UNKNOWN-IP",
    }
  }
}
