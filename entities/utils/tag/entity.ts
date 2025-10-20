import { TagEntitySimpleDbData } from "@/entities/utils/tag/query"
import { TagSimpleOutput } from "@/schemas/utils"

export class TagEntity {
  static getSimpleRo(entity: TagEntitySimpleDbData): TagSimpleOutput {
    return {
      id: entity.id,

      name: entity.name,
      color: entity.color,

      userId: entity.userId,
      containerId: entity.containerId,
    }
  }
}
