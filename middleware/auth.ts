import type { AuthenticatedContext, PublicContext } from "@/orpc/types"
import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"

export const publicMiddleware = async ({
  context,
  next,
}: {
  context: PublicContext
  next: MiddlewareNextFn<PublicContext>
}) => {
  return next({ context })
}

export const authMiddleware = async ({
  context,
  next,
}: {
  context: PublicContext
  next: MiddlewareNextFn<unknown>
}) => {
  if (!context.session || !context.user) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      ...context,
      session: context.session,
      user: context.user,
    },
  })
}
