import { createContext } from "@/orpc/context"
import { appRouter } from "@/orpc/routers"
import { RPCHandler } from "@orpc/server/fetch"

const handler = new RPCHandler(appRouter)

async function handleRequest(request: Request) {
  try {
    const { response } = await handler.handle(request, {
      prefix: "/api/orpc",
      context: await createContext(),
    })

    return response ?? new Response("Not found", { status: 404 })
  } catch (error) {
    console.error("RPC handler error:", error)

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
