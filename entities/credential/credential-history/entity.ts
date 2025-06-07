import { CredentialHistorySimpleRo } from "@/schemas/credential"

import { CredentialHistoryEntitySimpleDbData } from "./query"

export class CredentialHistoryEntity {
  static getSimpleRo(
    entity: CredentialHistoryEntitySimpleDbData
  ): CredentialHistorySimpleRo {
    return {
      id: entity.id,

      changedAt: entity.changedAt,

      userId: entity.userId,
      credentialId: entity.credentialId,

      passwordEncryptionId: entity.passwordEncryptionId,
    }
  }
}
