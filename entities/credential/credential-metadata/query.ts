import { type Prisma } from "@prisma/client"

export type CredentialMetadataEntitySimpleDbData =
  Prisma.CredentialMetadataGetPayload<{
    include: ReturnType<typeof CredentialMetadataQuery.getSimpleInclude>
  }>

export class CredentialMetadataQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialMetadataInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      keyValuePairs: {
        include: {
          valueEncryption: true,
        },
      },
    } satisfies Prisma.CredentialMetadataInclude
  }
}
