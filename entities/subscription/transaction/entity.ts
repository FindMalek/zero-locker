import { InvoiceEntity } from "@/entities/subscription/invoice/entity"
import { SubscriptionEntity } from "@/entities/subscription/subscription/entity"
import {
  TransactionEntityIncludeDbData,
  TransactionEntitySimpleDbData,
} from "@/entities/subscription/transaction/query"
import {
  TransactionIncludeOutput,
  TransactionSimpleOutput,
} from "@/schemas/subscription"

export class TransactionEntity {
  static getSimpleRo(
    entity: TransactionEntitySimpleDbData
  ): TransactionSimpleOutput {
    return {
      id: entity.id,
      transactionId: entity.transactionId,
      subscriptionId: entity.subscriptionId,
      amount: Number(entity.amount),
      currency: entity.currency,
      status: entity.status,
      description: entity.description,
      paymentDate: entity.paymentDate,
      refundedAt: entity.refundedAt,
      refundAmount: entity.refundAmount ? Number(entity.refundAmount) : null,
      billingPeriodStart: entity.billingPeriodStart,
      billingPeriodEnd: entity.billingPeriodEnd,
      failureReason: entity.failureReason,
      metadata: entity.metadata as Record<string, unknown> | null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static getRo(
    entity: TransactionEntityIncludeDbData
  ): TransactionIncludeOutput {
    const base = this.getSimpleRo(entity)
    return {
      ...base,
      subscription: SubscriptionEntity.getSimpleRo(entity.subscription),
      invoice: entity.invoice
        ? InvoiceEntity.getSimpleRo(entity.invoice)
        : null,
    }
  }
}
