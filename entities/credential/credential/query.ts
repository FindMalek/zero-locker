import { type Prisma } from "@prisma/client"

import { CredentialMetadataQuery } from "../credential-metadata/query"

export type CredentialEntitySimpleDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getSimpleInclude>
}>

export type CredentialEntityIncludeDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getInclude>
}>

export type CredentialEntityClientSafeDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getClientSafeInclude>
}>

export class CredentialQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialInclude
  }

  // WARNING: This include exposes encryption keys via metadata - only use for server-side operations
  // For client-facing endpoints, use getClientSafeInclude() instead
  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      tags: true,
      metadata: {
        include: CredentialMetadataQuery.getInclude(),
      },
    } satisfies Prisma.CredentialInclude
  }

  // For client-facing endpoints that should not expose encryption keys
  static getClientSafeInclude() {
    return {
      ...this.getSimpleInclude(),
      tags: true,
      metadata: {
        include: CredentialMetadataQuery.getClientSafeInclude(),
      },
    } satisfies Prisma.CredentialInclude
  }
}
