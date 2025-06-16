import { os } from "@orpc/server"
import { z } from "zod"

// Simple demo procedure to test oRPC setup
export const demoRouter = {
  hello: os
    .input(z.object({ name: z.string() }))
    .output(z.object({ message: z.string() }))
    .handler(async ({ input }) => {
      return { message: `Hello, ${input.name}!` }
    }),

  ping: os
    .output(z.object({ message: z.string(), timestamp: z.number() }))
    .handler(async () => {
      return {
        message: "pong",
        timestamp: Date.now(),
      }
    }),
}
