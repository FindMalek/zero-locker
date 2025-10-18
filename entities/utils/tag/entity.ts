import { TagEntitySimpleDbData } from "@/entities/utils/tag/query"
import { TagSimpleRo } from "@/schemas/utils/tag"

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
