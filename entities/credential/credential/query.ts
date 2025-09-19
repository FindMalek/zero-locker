import { type Prisma } from "@prisma/client"

import { CredentialMetadataQuery } from "../credential-metadata/query"

export type CredentialEntitySimpleDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getSimpleInclude>
}>

export type CredentialEntityIncludeDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getInclude>
}>

export class CredentialQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      tags: true,
      metadata: {
        include: CredentialMetadataQuery.getInclude(),
      },
    } satisfies Prisma.CredentialInclude
  }
}
