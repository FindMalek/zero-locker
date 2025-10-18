import { CredentialMetadataEntitySimpleDbData } from "@/entities/credential/credential-metadata/query"
import { CredentialMetadataSimpleRo } from "@/schemas/credential"

export class CredentialMetadataEntity {
  static getSimpleRo(
    entity: CredentialMetadataEntitySimpleDbData
  ): CredentialMetadataSimpleRo {
    return {
      id: entity.id,

      recoveryEmail: entity.recoveryEmail,
      phoneNumber: entity.phoneNumber,
      has2FA: entity.has2FA,

      credentialId: entity.credentialId,
    }
  }
}
