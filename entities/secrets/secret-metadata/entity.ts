import { SecretMetadataSimpleRo } from "@/schemas/secrets"

import { SecretMetadataEntitySimpleDbData } from "./query"

export class SecretMetadataEntity {
  static getSimpleRo(
    entity: SecretMetadataEntitySimpleDbData
  ): SecretMetadataSimpleRo {
    return {
      id: entity.id,
      type: entity.type,
      status: entity.status,
      expiresAt: entity.expiresAt,
      otherInfo: Array.isArray(entity.otherInfo) ? entity.otherInfo : [],
      secretId: entity.secretId,
    }
  }
}
