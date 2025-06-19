import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"

import type { AppRouter } from "../routers"

// Create the RPC link
const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/orpc`,
  headers: {
    "Content-Type": "application/json",
  },
})

// Create the oRPC client with proper typing
export const rpcClient: RouterClient<AppRouter> = createORPCClient(link)
