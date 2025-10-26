import { cardRouter } from "./card"
import { containerRouter } from "./container"
import { credentialRouter } from "./credential"
import { platformRouter } from "./platform"
import { secretRouter } from "./secret"
import { tagRouter } from "./tag"
import { testRouter } from "./test"
import { userRouter } from "./user"
import { webhookRouter } from "./webhook"

export const appRouter = {
  cards: cardRouter,
  credentials: credentialRouter,
  secrets: secretRouter,
  containers: containerRouter,
  platforms: platformRouter,
  tags: tagRouter,
  users: userRouter,
  webhooks: webhookRouter,
  test: testRouter,
}

export type AppRouter = typeof appRouter
