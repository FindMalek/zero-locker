import { EncryptedDataSimpleRo } from "@/schemas/encryption/encryption"

import { EncryptedDataEntitySimpleDbData } from "./query"

export class EncryptedDataEntity {
  static getSimpleRo(
    entity: EncryptedDataEntitySimpleDbData
  ): EncryptedDataSimpleRo {
    return {
      id: entity.id,
      encryptedValue: entity.encryptedValue,
      encryptionKey: entity.encryptionKey,
      iv: entity.iv,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}
