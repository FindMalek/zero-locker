import type { AuthenticatedContext, PublicContext } from "@/orpc/types"
import { ORPCError } from "@orpc/server"

export const publicMiddleware = async ({
  context,
  next,
}: {
  context: PublicContext
  next: (opts: { context: PublicContext }) => Promise<any>
}) => {
  return next({ context })
}

export const authMiddleware = async ({
  context,
  next,
}: {
  context: PublicContext
  next: (opts: { context: AuthenticatedContext }) => Promise<any>
}) => {
  if (!context.session || !context.user) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({
    context: {
      session: context.session,
      user: context.user,
    },
  })
}
