import { createContext } from "@/orpc/context"
import { appRouter } from "@/orpc/routers"
import type { ORPCContext } from "@/orpc/types"
import { RPCHandler } from "@orpc/server/fetch"

const handler = new RPCHandler(appRouter)

/**
 * Parse request body and attach to context for handlers that need raw body access
 * (e.g., webhook handlers that use context.body instead of .input())
 */
async function parseRequestBody(
  request: Request,
  context: ORPCContext
): Promise<ORPCContext> {
  // Only parse body for requests that typically have one
  if (request.method === "GET" || request.method === "DELETE") {
    return context
  }

  try {
    const bodyText = await request.clone().text()
    if (bodyText) {
      context.body = JSON.parse(bodyText)
    }
  } catch {
    // Not JSON or empty - ignore
  }

  return context
}

async function handleRequest(request: Request) {
  try {
    const context = await createContext(request)
    const contextWithBody = await parseRequestBody(request, context)

    const { response } = await handler.handle(request, {
      prefix: "/api/orpc",
      context: contextWithBody,
    })

    return response ?? new Response("Not found", { status: 404 })
  } catch (error) {
    console.error("oRPC handler error:", error)

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
