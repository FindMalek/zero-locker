import { type Prisma } from "@prisma/client"

export type SecretEntitySimpleDbData = Prisma.SecretGetPayload<{
  include: ReturnType<typeof SecretQuery.getSimpleInclude>
}>

export class SecretQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.SecretInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      valueEncryption: true,
    } satisfies Prisma.SecretInclude
  }
}
