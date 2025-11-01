import { type Prisma } from "@prisma/client"

import { SubscriptionQuery } from "../subscription/query"
import { TransactionQuery } from "../transaction/query"

export type InvoiceEntitySimpleDbData = Prisma.InvoiceGetPayload<{
  include: ReturnType<typeof InvoiceQuery.getSimpleInclude>
}>

export type InvoiceEntityIncludeDbData = Prisma.InvoiceGetPayload<{
  include: ReturnType<typeof InvoiceQuery.getInclude>
}>

export class InvoiceQuery {
  static getSimpleInclude() {
    return {} satisfies Prisma.InvoiceInclude
  }

  static getSimpleSelect() {
    return {
      id: true,
      invoiceNumber: true,
    } satisfies Prisma.InvoiceSelect
  }

  static getInclude() {
    return {
      ...this.getSimpleInclude(),
      subscription: {
        include: SubscriptionQuery.getSimpleInclude(),
      },
      transaction: {
        include: TransactionQuery.getSimpleInclude(),
      },
    } satisfies Prisma.InvoiceInclude
  }
}
