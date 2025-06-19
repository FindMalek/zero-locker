import { createRouterClient } from "@orpc/server"
import type { RouterClient } from "@orpc/server"

import { appRouter } from "../routers"
import type { ORPCContext } from "../types"

/**
 * Server-side oRPC client for SSR optimization
 * This eliminates HTTP requests during server-side rendering
 */
export function createServerClient(context: ORPCContext): RouterClient<typeof appRouter> {
  return createRouterClient(appRouter, {
    context: () => context,
  })
}

export type ServerClient = RouterClient<typeof appRouter> 