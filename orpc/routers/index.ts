import { cardRouter } from "./card"
import { containerRouter } from "./container"
import { credentialRouter } from "./credential"
import { secretRouter } from "./secret"

export const appRouter = {
  cards: cardRouter,
  credentials: credentialRouter,
  secrets: secretRouter,
  containers: containerRouter,
}

export type AppRouter = typeof appRouter
