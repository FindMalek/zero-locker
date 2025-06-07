import { type Prisma } from "@prisma/client"

export type TagEntitySimpleDbData = Prisma.TagGetPayload<{
  include: ReturnType<typeof TagQuery.getSimpleInclude>
}>

export class TagQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.TagInclude
  }
}
