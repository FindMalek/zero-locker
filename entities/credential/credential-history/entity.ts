import { CredentialHistoryEntitySimpleDbData } from "@/entities/credential/credential-history/query"
import { HistorySimpleOutput } from "@/schemas/credential/history"

export class CredentialHistoryEntity {
  static getSimpleRo(
    entity: CredentialHistoryEntitySimpleDbData
  ): HistorySimpleOutput {
    return {
      id: entity.id,

      changedAt: entity.changedAt,

      userId: entity.userId,
      credentialId: entity.credentialId,

      passwordEncryptionId: entity.passwordEncryptionId,
    }
  }
}
