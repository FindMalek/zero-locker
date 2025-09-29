import {
  getDatabaseClient,
  type PrismaTransactionClient,
} from "@/prisma/client"
import type { TagDto } from "@/schemas/utils/tag"
import type { Prisma, Tag } from "@prisma/client"

import { generateTagColor } from "./color-helpers"

export async function createTagsAndGetConnections(
  tags: TagDto[],
  userId: string,
  containerId?: string
): Promise<Prisma.TagCreateNestedManyWithoutContainerInput>
export async function createTagsAndGetConnections(
  tags: TagDto[],
  userId: string,
  containerId: string | undefined,
  tx: PrismaTransactionClient
): Promise<Prisma.TagCreateNestedManyWithoutContainerInput>
export async function createTagsAndGetConnections(
  tags: TagDto[],
  userId: string,
  containerId?: string,
  tx?: PrismaTransactionClient
): Promise<Prisma.TagCreateNestedManyWithoutContainerInput> {
  if (!tags || tags.length === 0) {
    return { connect: [] }
  }

  const client = getDatabaseClient(tx)

  // Build a map keyed by the lower-cased, trimmed name, but keep each tag's original trimmed case
  const tagMap = new Map(
    tags
      .map((t) => {
        const trimmedName = t.name.trim()
        if (!trimmedName) return null
        return [trimmedName.toLowerCase(), { ...t, name: trimmedName }]
      })
      .filter(Boolean) as [string, TagDto][]
  )
  const normalizedTags = Array.from(tagMap.values())
  const normalizedNames = Array.from(tagMap.keys())

  // Look up existing tags case-insensitively
  const existingTags = await client.tag.findMany({
    where: {
      name: { in: normalizedNames, mode: "insensitive" },
      userId,
      OR: [{ containerId: containerId || null }, { containerId: null }],
    },
  })

  // Deduplicate by the lower-cased key, preferring container-specific tags over container-null
  const existingTagsByName = new Map<string, Tag>()
  for (const tag of existingTags) {
    const key = tag.name.trim().toLowerCase()
    const existingTag = existingTagsByName.get(key)
    if (!existingTag) {
      existingTagsByName.set(key, tag)
    } else if (
      tag.containerId === (containerId || null) &&
      existingTag.containerId === null
    ) {
      existingTagsByName.set(key, tag)
    }
  }

  // Only create those tags whose lower-cased name isn't already present
  const tagsToCreate = normalizedTags.filter(
    (tag) => !existingTagsByName.has(tag.name.toLowerCase())
  )

  let newTags: Tag[] = []
  if (tagsToCreate.length > 0) {
    const createData = tagsToCreate.map((tag) => ({
      name: tag.name,
      color: tag.color ?? generateTagColor(tag.name, "pastel"),
      userId,
      containerId: containerId || null,
    }))

    await client.tag.createMany({
      data: createData,
      // NOTE: Requires relevant unique index; see note below.
      skipDuplicates: true,
    })

    newTags = await client.tag.findMany({
      where: {
        name: { in: tagsToCreate.map((tag) => tag.name) },
        userId,
        containerId: containerId || null,
      },
    })
  }

  const allTags = [...Array.from(existingTagsByName.values()), ...newTags]
  const tagConnections = allTags.map((tag) => ({ id: tag.id }))

  return { connect: tagConnections }
}
