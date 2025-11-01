import { type Prisma } from "@prisma/client"

import { SubscriptionQuery } from "../subscription/query"

export type SubscriptionHistoryEntitySimpleDbData =
  Prisma.PaymentSubscriptionHistoryGetPayload<{
    include: ReturnType<typeof SubscriptionHistoryQuery.getSimpleInclude>
  }>

export type SubscriptionHistoryEntityIncludeDbData =
  Prisma.PaymentSubscriptionHistoryGetPayload<{
    include: ReturnType<typeof SubscriptionHistoryQuery.getInclude>
  }>

export class SubscriptionHistoryQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.PaymentSubscriptionHistoryInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      subscription: {
        include: SubscriptionQuery.getSimpleInclude(),
      },
    } satisfies Prisma.PaymentSubscriptionHistoryInclude
  }
}
