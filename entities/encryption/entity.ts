import { EncryptedDataEntitySimpleDbData } from "@/entities/encryption/query"
import { EncryptedDataSimpleOutput } from "@/schemas/encryption"
import { Prisma } from "@prisma/client"

export class EncryptedDataEntity {
  static getSimpleRo(
    entity: EncryptedDataEntitySimpleDbData
  ): EncryptedDataSimpleOutput {
    return {
      id: entity.id,

      iv: entity.iv,
      encryptedValue: entity.encryptedValue,
      encryptionKey: entity.encryptionKey,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static getSelect() {
    return {
      id: true,
      iv: true,
      encryptedValue: true,
      encryptionKey: true,
    } satisfies Prisma.EncryptedDataSelect
  }
}
