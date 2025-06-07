import { type Prisma } from "@prisma/client"

export type CardEntitySimpleDbData = Prisma.CardGetPayload<{
  include: ReturnType<typeof CardQuery.getSimpleInclude>
}>

export type CardEntityDbData = Prisma.CardGetPayload<{
  include: ReturnType<typeof CardQuery.getInclude>
}>

export class CardQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CardInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      cvvEncryption: true,
      numberEncryption: true,
    } satisfies Prisma.CardInclude
  }
}
