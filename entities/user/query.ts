import { type Prisma } from "@prisma/client"

export type UserEntitySimpleDbData = Prisma.UserGetPayload<{
  include: ReturnType<typeof UserQuery.getSimpleInclude>
}>

export class UserQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.UserInclude
  }
}
