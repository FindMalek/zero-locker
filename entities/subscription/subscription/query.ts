import { type Prisma } from "@prisma/client"

import { ProductQuery } from "../product/query"

export type SubscriptionEntitySimpleDbData =
  Prisma.PaymentSubscriptionGetPayload<{
    include: ReturnType<typeof SubscriptionQuery.getSimpleInclude>
  }>

export type SubscriptionEntityIncludeDbData =
  Prisma.PaymentSubscriptionGetPayload<{
    include: ReturnType<typeof SubscriptionQuery.getInclude>
  }>

export class SubscriptionQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.PaymentSubscriptionInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      product: {
        include: ProductQuery.getSimpleInclude(),
      },
    } satisfies Prisma.PaymentSubscriptionInclude
  }
}
