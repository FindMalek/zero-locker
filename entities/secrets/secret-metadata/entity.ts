import { SecretMetadataSimpleOutput } from "@/schemas/secrets"

import { SecretMetadataEntitySimpleDbData } from "./query"

export class SecretMetadataEntity {
  static getSimpleRo(
    entity: SecretMetadataEntitySimpleDbData
  ): SecretMetadataSimpleOutput {
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
