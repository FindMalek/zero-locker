import { type Prisma } from "@prisma/client"

export type SecretMetadataEntitySimpleDbData = Prisma.SecretMetadataGetPayload<{
  include: ReturnType<typeof SecretMetadataQuery.getSimpleInclude>
}>

export class SecretMetadataQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.SecretMetadataInclude
  }
}
