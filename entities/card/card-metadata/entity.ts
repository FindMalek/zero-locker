import { CardMetadataSimpleOutput } from "@/schemas/card"

import { CardMetadataEntitySimpleDbData } from "./query"

export class CardMetadataEntity {
  static getSimpleRo(
    entity: CardMetadataEntitySimpleDbData
  ): CardMetadataSimpleOutput {
    return {
      id: entity.id,

      creditLimit: entity.creditLimit ? Number(entity.creditLimit) : null,
      availableCredit: entity.availableCredit
        ? Number(entity.availableCredit)
        : null,
      interestRate: entity.interestRate ? Number(entity.interestRate) : null,
      annualFee: entity.annualFee ? Number(entity.annualFee) : null,
      rewardsProgram: entity.rewardsProgram,

      contactlessEnabled: entity.contactlessEnabled,
      onlinePaymentsEnabled: entity.onlinePaymentsEnabled,
      internationalPaymentsEnabled: entity.internationalPaymentsEnabled,
      pinSet: entity.pinSet,

      otherInfo: Array.isArray(entity.otherInfo) ? entity.otherInfo : null,

      cardId: entity.cardId,
    }
  }
}
