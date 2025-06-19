import { createTanstackQueryUtils } from "@orpc/tanstack-query"

import { rpcClient } from "./rpc"

// Create Tanstack Query utils
export const orpc = createTanstackQueryUtils(rpcClient, {
  path: ["orpc"],
})
