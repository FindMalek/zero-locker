import { createRouterClient } from "@orpc/server"
import type { RouterClient } from "@orpc/server"

import { appRouter } from "../routers"
import type { ORPCContext } from "../types"

/**
 * Creates a server-side oRPC client instance for the app router using the provided SSR context.
 *
 * This client enables direct invocation of router procedures during server-side rendering, bypassing HTTP requests.
 *
 * @param context - The server-side rendering context to be used for procedure calls
 * @returns A router client instance bound to the app router and the given context
 */
export function createServerClient(
  context: ORPCContext
): RouterClient<typeof appRouter> {
  return createRouterClient(appRouter, {
    context: () => context,
  })
}

export type ServerClient = RouterClient<typeof appRouter>
