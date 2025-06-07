import { CredentialSimpleRo } from "@/schemas/credential"

import { CredentialEntityDbData } from "./query"

export class CredentialEntity {
  static getSimpleRo(entity: CredentialEntityDbData): CredentialSimpleRo {
    return {
      id: entity.id,

      username: entity.username,

      // TODO: Consider masking or partial display for ROs if sensitive
      password: entity.passwordEncryption?.encryptedValue || "",

      status: entity.status,

      description: entity.description,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
      platformId: entity.platformId,
      containerId: entity.containerId,
    }
  }
}
