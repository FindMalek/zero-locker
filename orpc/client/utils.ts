import { createTanstackQueryUtils } from "@orpc/tanstack-query"

import { rpcClient } from "./rpc"

export const orpc = createTanstackQueryUtils(rpcClient, {
  path: ["orpc"],
})
