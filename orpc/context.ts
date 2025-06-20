import { headers } from "next/headers"

import { auth } from "@/lib/auth/server"

import type { ORPCContext } from "./types"

/**
 * Creates an ORPC context containing the current session and user information.
 *
 * Attempts to retrieve authentication data using the current request headers. If authentication fails or no session is found, both `session` and `user` are set to `null`.
 *
 * @returns An object with `session` and `user` properties representing the current authentication state.
 */
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
