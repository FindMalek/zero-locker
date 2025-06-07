import { TagSimpleRo } from "@/schemas/utils/tag"

import { TagEntitySimpleDbData } from "./query"

export class TagEntity {
  static getSimpleRo(entity: TagEntitySimpleDbData): TagSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      color: entity.color,

      userId: entity.userId,
      containerId: entity.containerId,
    }
  }
}
