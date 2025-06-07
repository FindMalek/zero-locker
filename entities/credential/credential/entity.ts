import {
  accountStatusEnum,
  AccountStatusInfer,
  CredentialSimpleRo,
} from "@/schemas/credential"
import { AccountStatus } from "@prisma/client"

import { CredentialEntitySimpleDbData } from "./query"

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
