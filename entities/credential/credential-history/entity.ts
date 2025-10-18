import { CredentialHistoryEntitySimpleDbData } from "@/entities/credential/credential-history/query"
import { CredentialHistorySimpleRo } from "@/schemas/credential"

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
