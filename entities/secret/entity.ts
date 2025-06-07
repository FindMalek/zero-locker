import { SecretSimpleRo } from "@/schemas/secret"

import { SecretEntitySimpleDbData } from "./query"

export class SecretEntity {
  static getSimpleRo(entity: SecretEntitySimpleDbData): SecretSimpleRo {
    return {
      id: entity.id,

      name: entity.name,

      // TODO: Consider masking or partial display for ROs if sensitive
      value: entity.valueEncryption?.encryptedValue || "",

      note: entity.note,

      lastCopied: entity.lastCopied,
      lastViewed: entity.lastViewed,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
      containerId: entity.containerId,
    }
  }
}
