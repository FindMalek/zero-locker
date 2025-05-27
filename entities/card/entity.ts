import { CardSimpleRo } from "@/schemas/card"

import { CardEntitySimpleDbData } from "./query"

export class CardEntity {
  static getSimpleRo(entity: CardEntitySimpleDbData): CardSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      description: entity.description,
      notes: entity.notes,

      type: entity.type,
      status: entity.status,
      provider: entity.provider,

      // TODO: Consider masking or partial display for ROs if sensitive
      number: entity.number,
      expiryDate: entity.expiryDate,
      cvv: entity.cvv,
      encryptionKey: entity.encryptionKey,
      iv: entity.iv,
      billingAddress: entity.billingAddress,
      cardholderName: entity.cardholderName,
      cardholderEmail: entity.cardholderEmail,

      lastCopied: entity.lastCopied,
      lastViewed: entity.lastViewed,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      userId: entity.userId,
      containerId: entity.containerId,
    }
  }
}
