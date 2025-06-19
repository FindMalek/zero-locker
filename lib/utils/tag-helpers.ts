import { database } from "@/prisma/client"
import type { TagDto } from "@/schemas/utils/tag"
import type { Prisma } from "@prisma/client"

export async function createTagsAndGetConnections(
  tags: TagDto[],
  userId: string,
  containerId?: string
): Promise<Prisma.TagCreateNestedManyWithoutContainerInput> {
  if (!tags || tags.length === 0) {
    return { connect: [] }
  }

  const tagConnections = []

  for (const tag of tags) {
    // Check if tag already exists
    let existingTag = await database.tag.findFirst({
      where: {
        name: tag.name,
        userId,
        containerId: containerId || null,
      },
    })

    if (!existingTag) {
      // Create new tag
      existingTag = await database.tag.create({
        data: {
          name: tag.name,
          color: tag.color,
          userId,
          containerId: containerId || null,
        },
      })
    }

    tagConnections.push({ id: existingTag.id })
  }

  return { connect: tagConnections }
}
