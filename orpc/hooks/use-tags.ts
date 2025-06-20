"use client"

import { orpc } from "@/orpc/client"
import type { ListTagsInput } from "@/schemas/utils/dto"
import { useQuery } from "@tanstack/react-query"

/**
 * React hook to fetch a paginated list of tags.
 *
 * @param input - Optional pagination parameters for the tag list
 * @returns The query result containing loading, error, and data states for the tag list
 */
export function useTags(input: ListTagsInput = { page: 1, limit: 100 }) {
  return useQuery(
    orpc.tags.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}
