import { InvoiceEntity } from "@/entities/subscription/invoice/entity"
import { SubscriptionEntity } from "@/entities/subscription/subscription/entity"
import {
  TransactionEntityIncludeDbData,
  TransactionEntitySimpleDbData,
} from "@/entities/subscription/transaction/query"
import {
  paymentTransactionStatusEnum,
  TransactionIncludeOutput,
  TransactionSimpleOutput,
  type PaymentTransactionStatusInfer,
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

  /**
   * Get formatted label for payment transaction status
   * @param status - The payment transaction status
   * @returns Formatted status label string
   */
  static getStatusLabel(status: PaymentTransactionStatusInfer): string {
    switch (status) {
      case paymentTransactionStatusEnum.SUCCESS:
        return "Success"
      case paymentTransactionStatusEnum.PENDING:
        return "Pending"
      case paymentTransactionStatusEnum.FAILED:
        return "Failed"
      case paymentTransactionStatusEnum.REFUNDED:
        return "Refunded"
      case paymentTransactionStatusEnum.PARTIALLY_REFUNDED:
        return "Partially Refunded"
    }
  }
}
