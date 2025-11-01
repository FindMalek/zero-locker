import {
  InvoiceEntityIncludeDbData,
  InvoiceEntitySimpleDbData,
} from "@/entities/subscription/invoice/query"
import { SubscriptionEntity } from "@/entities/subscription/subscription/entity"
import { TransactionEntity } from "@/entities/subscription/transaction/entity"
import {
  InvoiceIncludeOutput,
  InvoiceSimpleOutput,
} from "@/schemas/subscription"

export class InvoiceEntity {
  static getSimpleRo(entity: InvoiceEntitySimpleDbData): InvoiceSimpleOutput {
    return {
      id: entity.id,
      invoiceNumber: entity.invoiceNumber,
      subscriptionId: entity.subscriptionId,
      amount: Number(entity.amount),
      currency: entity.currency,
      status: entity.status,
      dueDate: entity.dueDate,
      paidAt: entity.paidAt,
      billingPeriodStart: entity.billingPeriodStart,
      billingPeriodEnd: entity.billingPeriodEnd,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static getRo(entity: InvoiceEntityIncludeDbData): InvoiceIncludeOutput {
    const base = this.getSimpleRo(entity)
    return {
      ...base,
      subscription: SubscriptionEntity.getSimpleRo(entity.subscription),
      transaction: entity.transaction
        ? TransactionEntity.getSimpleRo(entity.transaction)
        : null,
    }
  }
}
