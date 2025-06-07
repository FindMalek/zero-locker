import { CredentialMetadataSimpleRo } from "@/schemas/credential"

import { CredentialMetadataEntitySimpleDbData } from "./query"

export class CredentialMetadataEntity {
  static getSimpleRo(
    entity: CredentialMetadataEntitySimpleDbData
  ): CredentialMetadataSimpleRo {
    return {
      id: entity.id,

      recoveryEmail: entity.recoveryEmail,
      phoneNumber: entity.phoneNumber,
      has2FA: entity.has2FA,

      otherInfo: Array.isArray(entity.otherInfo) ? entity.otherInfo : null,

      credentialId: entity.credentialId,
    }
  }
}
