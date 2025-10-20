import { CredentialMetadataEntitySimpleDbData } from "@/entities/credential/credential-metadata/query"
import { MetadataSimpleOutput } from "@/schemas/credential/metadata"

export class CredentialMetadataEntity {
  static getSimpleRo(
    entity: CredentialMetadataEntitySimpleDbData
  ): MetadataSimpleOutput {
    return {
      id: entity.id,

      recoveryEmail: entity.recoveryEmail,
      phoneNumber: entity.phoneNumber,
      has2FA: entity.has2FA,

      credentialId: entity.credentialId,
    }
  }
}
