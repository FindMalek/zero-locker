import { ContainerSimpleRo } from "@/schemas/container"
import { EntityType, EntityTypeEnum } from "@/schemas/utils"
import { ContainerType } from "@prisma/client"

import { ContainerEntitySimpleDbData } from "./query"

export class ContainerEntity {
  static getSimpleRo(entity: ContainerEntitySimpleDbData): ContainerSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      icon: entity.icon,

      description: entity.description,
      type: entity.type,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
    }
  }

  /**
   * Validates if an entity type can be added to a container based on container type
   */
  static validateEntityForContainer(
    containerType: ContainerType,
    entityType: EntityType
  ): boolean {
    switch (containerType) {
      case ContainerType.MIXED:
        return true
      case ContainerType.SECRETS_ONLY:
        return entityType === EntityTypeEnum.SECRET
      case ContainerType.CREDENTIALS_ONLY:
        return entityType === EntityTypeEnum.CREDENTIAL
      case ContainerType.CARDS_ONLY:
        return entityType === EntityTypeEnum.CARD
      default:
        return false
    }
  }

  /**
   * Gets the allowed entity types for a container
   */
  static getAllowedEntityTypes(containerType: ContainerType): string[] {
    switch (containerType) {
      case ContainerType.MIXED:
        return [
          EntityTypeEnum.SECRET,
          EntityTypeEnum.CREDENTIAL,
          EntityTypeEnum.CARD,
        ]
      case ContainerType.SECRETS_ONLY:
        return [EntityTypeEnum.SECRET]
      case ContainerType.CREDENTIALS_ONLY:
        return [EntityTypeEnum.CREDENTIAL]
      case ContainerType.CARDS_ONLY:
        return [EntityTypeEnum.CARD]
      default:
        return []
    }
  }
}
