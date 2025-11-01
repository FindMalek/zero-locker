import {
  SubscriptionHistoryEntityIncludeDbData,
  SubscriptionHistoryEntitySimpleDbData,
} from "@/entities/subscription/history/query"
import { SubscriptionEntity } from "@/entities/subscription/subscription/entity"
import {
  SubscriptionHistoryIncludeOutput,
  SubscriptionHistorySimpleOutput,
} from "@/schemas/subscription"

export class SubscriptionHistoryEntity {
  static getSimpleRo(
    entity: SubscriptionHistoryEntitySimpleDbData
  ): SubscriptionHistorySimpleOutput {
    return {
      id: entity.id,
      subscriptionId: entity.subscriptionId,
      previousStatus: entity.previousStatus,
      newStatus: entity.newStatus,
      previousPrice: entity.previousPrice ? Number(entity.previousPrice) : null,
      newPrice: entity.newPrice ? Number(entity.newPrice) : null,
      reason: entity.reason,
      metadata: entity.metadata as Record<string, unknown> | null,
      changedAt: entity.changedAt,
      changedBy: entity.changedBy,
    }
  }

  static getRo(
    entity: SubscriptionHistoryEntityIncludeDbData
  ): SubscriptionHistoryIncludeOutput {
    const base = this.getSimpleRo(entity)
    return {
      ...base,
      subscription: SubscriptionEntity.getSimpleRo(entity.subscription),
    }
  }
}
