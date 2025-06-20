import { database } from "@/prisma/client"
import type { TagDto } from "@/schemas/utils/tag"
import type { Prisma } from "@prisma/client"

/**
 * Finds or creates tags for a user and optional container, returning a Prisma input object for connecting these tags.
 *
 * For each tag in the input array, ensures a tag with the same name, user ID, and container ID exists in the database, creating it if necessary. Returns an object suitable for nested tag connections in Prisma.
 *
 * @param tags - Array of tag data objects to find or create
 * @param userId - The ID of the user to associate with the tags
 * @param containerId - Optional container ID to further scope the tags
 * @returns Prisma input object with a `connect` property containing tag IDs
 */
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
