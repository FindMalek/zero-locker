import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

import type { ORPCContext } from "./types"

const UNKNOWN_IP = "UNKNOWN-IP"

/**
 * Vercel overwrites these headers at the edge, so clients can't spoof them.
 * Only reachable without them when running off-Vercel (e.g. local dev).
 */
function getClientIp(headersList: Headers): string {
  const ip =
    headersList.get("x-vercel-forwarded-for") ?? headersList.get("x-real-ip")

  return ip?.split(",")[0]?.trim() || UNKNOWN_IP
}

export async function createContext(): Promise<ORPCContext> {
  const headersList = await headers()
  const ip = getClientIp(headersList)

  try {
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
      ip,
    }
  }
}
