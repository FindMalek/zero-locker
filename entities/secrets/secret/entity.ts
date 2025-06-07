import { SecretSimpleRo } from "@/schemas/secrets"

import { SecretEntitySimpleDbData } from "./query"

export class SecretEntity {
  static getSimpleRo(entity: SecretEntitySimpleDbData): SecretSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      note: entity.note,

      lastViewed: entity.lastViewed,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
      containerId: entity.containerId,

      valueEncryptionId: entity.valueEncryptionId,
    }
  }
}
