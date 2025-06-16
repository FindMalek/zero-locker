import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

import type { ORPCContext } from "./types"

export async function createContext(): Promise<ORPCContext> {
  try {
    const authResult = await auth.api.getSession({
      headers: await headers(),
    })

    return {
      session: authResult?.session || null,
      user: authResult?.user || null,
    }
  } catch (error) {
    console.error("Failed to get session:", error)
    return {
      session: null,
      user: null,
    }
  }
}
