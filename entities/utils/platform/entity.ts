import { PlatformSimpleOutput } from "@/schemas/utils"
import { PlatformStatus } from "@prisma/client"

import { PlatformEntitySimpleDbData } from "./query"

export class PlatformEntity {
  static getSimpleRo(entity: PlatformEntitySimpleDbData): PlatformSimpleOutput {
    return {
      id: entity.id,

      name: entity.name,
      status: entity.status,

      logo: entity.logo,
      loginUrl: entity.loginUrl,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      userId: entity.userId,
    }
  }

  /**
   * Finds a platform by ID from a list of platforms.
   * Returns a fallback platform if not found instead of throwing an error.
   *
   * @param platforms - Array of platforms to search in
   * @param platformId - ID of the platform to find
   * @returns The found platform or a fallback platform
   */
  static findById(
    platforms: PlatformEntitySimpleDbData[],
    platformId: string
  ): PlatformSimpleOutput {
    const platform = platforms.find((p) => p.id === platformId)
    if (!platform) {
      return {
        id: platformId,
        name: "Unknown Platform",
        status: PlatformStatus.PENDING,
        logo: "",
        loginUrl: "",
        updatedAt: new Date(),
        createdAt: new Date(),
        userId: null,
      }
    }

    return PlatformEntity.getSimpleRo(platform)
  }

  /**
   * Finds a platform by ID from a list of platforms.
   * Throws an error if the platform is not found.
   * Use this method when you need strict validation.
   *
   * @param platforms - Array of platforms to search in
   * @param platformId - ID of the platform to find
   * @returns The found platform
   * @throws Error if platform is not found
   */
  static findByIdStrict(
    platforms: PlatformEntitySimpleDbData[],
    platformId: string
  ): PlatformSimpleOutput {
    const platform = platforms.find((p) => p.id === platformId)
    if (!platform) {
      throw new Error(`Platform with id ${platformId} not found`)
    }

    return PlatformEntity.getSimpleRo(platform)
  }
}
