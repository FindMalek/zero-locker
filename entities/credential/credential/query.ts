import { type Prisma } from "@prisma/client"

export type CredentialEntitySimpleDbData = Prisma.CredentialGetPayload<{
  include: ReturnType<typeof CredentialQuery.getSimpleInclude>
}>

export class CredentialQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.CredentialInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      passwordEncryption: true,
    } satisfies Prisma.CredentialInclude
  }
}
