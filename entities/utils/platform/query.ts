import { type Prisma } from "@prisma/client"

export type PlatformEntitySimpleDbData = Prisma.PlatformGetPayload<{
  include: ReturnType<typeof PlatformQuery.getSimpleInclude>
}>

export class PlatformQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.PlatformInclude
  }
}
