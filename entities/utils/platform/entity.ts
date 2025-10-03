import { PlatformSimpleRo } from "@/schemas/utils/platform"

import { PlatformEntitySimpleDbData } from "./query"

export class PlatformEntity {
  static getSimpleRo(entity: PlatformEntitySimpleDbData): PlatformSimpleRo {
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
   * Throws an error if the platform is not found.
   *
   * @param platforms - Array of platforms to search in
   * @param platformId - ID of the platform to find
   * @returns The found platform
   * @throws Error if platform is not found
   */
  static findById(
    platforms: PlatformEntitySimpleDbData[],
    platformId: string
  ): PlatformSimpleRo {
    const platform = platforms.find((p) => p.id === platformId)
    if (!platform) {
      throw new Error(`Platform with id ${platformId} not found`)
    }

    return PlatformEntity.getSimpleRo(platform)
  }
}
