import { createContext } from "@/orpc/context"
import { appRouter } from "@/orpc/routers"
import { RPCHandler } from "@orpc/server/fetch"

const handler = new RPCHandler(appRouter)

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/api/orpc",
    context: await createContext(),
  })

  return response ?? new Response("Not found", { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
