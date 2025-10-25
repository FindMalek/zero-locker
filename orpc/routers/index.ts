import { cardRouter } from "./card"
import { containerRouter } from "./container"
import { credentialRouter } from "./credential"
import { platformRouter } from "./platform"
import { secretRouter } from "./secret"
import { tagRouter } from "./tag"
import { testRouter } from "./test"
import { userRouter } from "./user"

export const appRouter = {
  cards: cardRouter,
  credentials: credentialRouter,
  secrets: secretRouter,
  containers: containerRouter,
  platforms: platformRouter,
  tags: tagRouter,
  users: userRouter,
  test: testRouter,
}

export type AppRouter = typeof appRouter
