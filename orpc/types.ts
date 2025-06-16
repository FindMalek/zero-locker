import type { Session, User } from "better-auth/types"

export interface ORPCContext {
  session: Session | null
  user: User | null
}

export interface AuthenticatedContext extends ORPCContext {
  session: Session
  user: User
}

export type PublicContext = ORPCContext
