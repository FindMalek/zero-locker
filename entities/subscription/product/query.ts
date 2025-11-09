import { type Prisma } from "@prisma/client"

export type ProductEntitySimpleDbData = Prisma.PaymentProductGetPayload<{
  include: ReturnType<typeof ProductQuery.getSimpleInclude>
}>

export class ProductQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.PaymentProductInclude
  }
}
