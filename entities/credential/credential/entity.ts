import { TagEntity } from "@/entities/utils"
import {
  accountStatusEnum,
  AccountStatusInfer,
  CredentialIncludeRo,
  CredentialSimpleRo,
} from "@/schemas/credential"
import { AccountStatus } from "@prisma/client"

import { decryptData } from "@/lib/encryption"
import {
  CredentialEntityIncludeDbData,
  CredentialEntitySimpleDbData,
} from "./query"

export class CredentialEntity {
  static getSimpleRo(entity: CredentialEntitySimpleDbData): CredentialSimpleRo {
    return {
      id: entity.id,

      identifier: entity.identifier,
      description: entity.description,

      status: entity.status,

      lastViewed: entity.lastViewed,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      platformId: entity.platformId,
      userId: entity.userId,
      containerId: entity.containerId,

      passwordEncryptionId: entity.passwordEncryptionId,
    }
  }

  static getRo(entity: CredentialEntityIncludeDbData): CredentialIncludeRo {
    return {
      ...this.getSimpleRo(entity),
      tags: entity.tags.map((tag) => TagEntity.getSimpleRo(tag)),
    }
  }

  // Helper method to extract security settings from metadata with decryption
  static async getSecuritySettings(entity: CredentialEntityIncludeDbData) {
    const metadata = entity.metadata?.[0]
    if (!metadata) {
      return {
        passwordProtection: true, // Default value when no metadata exists
        twoFactorAuth: false, // Default value when no metadata exists
        accessLogging: true, // Default value when no metadata exists
      }
    }

    // Look for security settings in key-value pairs and decrypt them
    const kvPairs = metadata.keyValuePairs || []
    let passwordProtection = true // Default value
    let accessLogging = true // Default value

    try {
      // Decrypt passwordProtection setting
      const passwordProtectionKv = kvPairs.find(kv => kv.key === 'passwordProtection')
      if (passwordProtectionKv?.valueEncryption) {
        const decryptedValue = await decryptData(
          passwordProtectionKv.valueEncryption.encryptedValue,
          passwordProtectionKv.valueEncryption.iv,
          passwordProtectionKv.valueEncryption.encryptionKey
        )
        passwordProtection = JSON.parse(decryptedValue)
      }

      // Decrypt accessLogging setting
      const accessLoggingKv = kvPairs.find(kv => kv.key === 'accessLogging')
      if (accessLoggingKv?.valueEncryption) {
        const decryptedValue = await decryptData(
          accessLoggingKv.valueEncryption.encryptedValue,
          accessLoggingKv.valueEncryption.iv,
          accessLoggingKv.valueEncryption.encryptionKey
        )
        accessLogging = JSON.parse(decryptedValue)
      }
    } catch (error) {
      console.error("Failed to decrypt security settings:", error)
      // Fall back to defaults if decryption fails - this is intentional behavior
      // We don't want to expose raw encrypted values to the client
    }

    return {
      passwordProtection,
      twoFactorAuth: metadata.has2FA, // This comes directly from the metadata table
      accessLogging,
    }
  }

  static convertPrismaToAccountStatus(
    status: AccountStatus
  ): AccountStatusInfer {
    switch (status) {
      case AccountStatus.ACTIVE:
        return accountStatusEnum.ACTIVE
      case AccountStatus.SUSPENDED:
        return accountStatusEnum.SUSPENDED
      case AccountStatus.DELETED:
        return accountStatusEnum.DELETED
    }
  }

  static convertAccountStatusToPrisma(
    status: AccountStatusInfer
  ): AccountStatus {
    switch (status) {
      case accountStatusEnum.ACTIVE:
        return AccountStatus.ACTIVE
      case accountStatusEnum.SUSPENDED:
        return AccountStatus.SUSPENDED
      case accountStatusEnum.DELETED:
        return AccountStatus.DELETED
    }
  }

  static convertAccountStatusToString(status: AccountStatusInfer): string {
    switch (status) {
      case accountStatusEnum.ACTIVE:
        return "Active"
      case accountStatusEnum.SUSPENDED:
        return "Suspended"
      case accountStatusEnum.DELETED:
        return "Deleted"
      default:
        return "Unknown"
    }
  }
}
