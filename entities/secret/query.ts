import { type Prisma } from "@prisma/client"

export type SecretEntitySimpleDbData = Prisma.SecretGetPayload<{
  include: ReturnType<typeof SecretQuery.getSimpleInclude>
}>

export class SecretQuery {
  static getSimpleInclude() {
    return {
      valueEncryption: true,
    } satisfies Prisma.SecretInclude
  }
}
