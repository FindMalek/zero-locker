import { type Prisma } from "@prisma/client"

export type CardMetadataEntitySimpleDbData = Prisma.CardMetadataGetPayload<{
  include: ReturnType<typeof CardMetadataQuery.getSimpleInclude>
}>

export class CardMetadataQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CardMetadataInclude
  }
}
