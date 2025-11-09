import {
  SubscriptionEntityIncludeDbData,
  SubscriptionEntitySimpleDbData,
} from "@/entities/subscription/subscription/query"
import {
  SubscriptionIncludeOutput,
  SubscriptionSimpleOutput,
} from "@/schemas/subscription"
import {
  lemonSqueezySubscriptionStatusEnum,
  type LemonSqueezySubscriptionStatus,
} from "@/schemas/subscription/webhook"
import { SubscriptionStatus } from "@prisma/client"

import { ProductEntity } from "../product/entity"

export class SubscriptionEntity {
  static getSimpleRo(
    entity: SubscriptionEntitySimpleDbData
  ): SubscriptionSimpleOutput {
    return {
      id: entity.id,
      subscriptionId: entity.subscriptionId,
      orderId: entity.orderId,
      customerId: entity.customerId,
      status: entity.status,
      productId: entity.productId,
      price: Number(entity.price),
      currency: entity.currency,
      endsAt: entity.endsAt,
      renewsAt: entity.renewsAt,
      trialEndsAt: entity.trialEndsAt,
      cancelledReason: entity.cancelledReason,
      cancelledAt: entity.cancelledAt,
      userId: entity.userId,
      lastWebhookAt: entity.lastWebhookAt,
      webhookCount: entity.webhookCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static getRo(
    entity: SubscriptionEntityIncludeDbData
  ): SubscriptionIncludeOutput {
    return {
      ...this.getSimpleRo(entity),
      product: ProductEntity.getSimpleRo(entity.product),
    }
  }

  /**
   * Converts Lemon Squeezy subscription status (from webhook) to our internal SubscriptionStatus enum
   *
   * @param status - Lemon Squeezy subscription status (from webhook payload)
   * @returns Internal SubscriptionStatus enum value
   *
   * @example
   * ```ts
   * const internalStatus = SubscriptionEntity.convertLemonSqueezyStatusToInternal("active") // Returns SubscriptionStatus.ACTIVE
   * ```
   */
  static convertLemonSqueezyStatusToInternal(
    status: LemonSqueezySubscriptionStatus
  ): SubscriptionStatus {
    switch (status) {
      case lemonSqueezySubscriptionStatusEnum.ACTIVE:
        return SubscriptionStatus.ACTIVE
      case lemonSqueezySubscriptionStatusEnum.ON_TRIAL:
        return SubscriptionStatus.ON_TRIAL
      case lemonSqueezySubscriptionStatusEnum.PAUSED:
        return SubscriptionStatus.PAUSED
      case lemonSqueezySubscriptionStatusEnum.PAST_DUE:
        return SubscriptionStatus.PAST_DUE
      case lemonSqueezySubscriptionStatusEnum.UNPAID:
        return SubscriptionStatus.UNPAID
      case lemonSqueezySubscriptionStatusEnum.CANCELLED:
        return SubscriptionStatus.CANCELLED
      case lemonSqueezySubscriptionStatusEnum.EXPIRED:
        return SubscriptionStatus.EXPIRED
    }
  }
}
