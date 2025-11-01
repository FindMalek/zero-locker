import { InvoiceQuery } from "@/entities/subscription/invoice/query"
import { SubscriptionQuery } from "@/entities/subscription/subscription/query"
import { type Prisma } from "@prisma/client"

export type TransactionEntitySimpleDbData =
  Prisma.PaymentTransactionGetPayload<{
    include: ReturnType<typeof TransactionQuery.getSimpleInclude>
  }>

export type TransactionEntityIncludeDbData =
  Prisma.PaymentTransactionGetPayload<{
    include: ReturnType<typeof TransactionQuery.getInclude>
  }>

export class TransactionQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.PaymentTransactionInclude
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      subscription: {
        include: SubscriptionQuery.getSimpleInclude(),
      },
      invoice: {
        include: InvoiceQuery.getSimpleInclude(),
      },
    } satisfies Prisma.PaymentTransactionInclude
  }
}
