import { type Prisma } from "@prisma/client"

export type CardEntitySimpleDbData = Prisma.CardGetPayload<{
  include: ReturnType<typeof CardQuery.getSimpleInclude>
}>

export class CardQuery {
  static getSimpleInclude() {
    return {
      cvvEncryption: true,
      numberEncryption: true,
    } satisfies Prisma.CardInclude
  }
}
