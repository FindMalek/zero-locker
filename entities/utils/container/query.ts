import { type Prisma } from "@prisma/client"

export type ContainerEntitySimpleDbData = Prisma.ContainerGetPayload<{
  include: ReturnType<typeof ContainerQuery.getSimpleInclude>
}>

export class ContainerQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.ContainerInclude
  }

  static getSecretsInclude() {
    return {
      secrets: true,
    } satisfies Prisma.ContainerInclude
  }
}
