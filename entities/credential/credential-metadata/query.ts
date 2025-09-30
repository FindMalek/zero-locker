import { type Prisma } from "@prisma/client"

export type CredentialMetadataEntitySimpleDbData =
  Prisma.CredentialMetadataGetPayload<{
    include: ReturnType<typeof CredentialMetadataQuery.getSimpleInclude>
  }>

export type CredentialMetadataEntityClientSafeDbData =
  Prisma.CredentialMetadataGetPayload<{
    include: ReturnType<typeof CredentialMetadataQuery.getClientSafeInclude>
  }>

export type CredentialMetadataEntityFullDbData =
  Prisma.CredentialMetadataGetPayload<{
    include: ReturnType<typeof CredentialMetadataQuery.getInclude>
  }>

export class CredentialMetadataQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialMetadataInclude
  }

  // WARNING: This include exposes encryption keys - only use for server-side operations
  // For client-facing endpoints, use getClientSafeInclude() instead
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

  static getClientSafeInclude() {
    return {
      ...this.getSimpleInclude(),
      keyValuePairs: {
        select: {
          id: true,
          key: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    } satisfies Prisma.CredentialMetadataInclude
  }
}
