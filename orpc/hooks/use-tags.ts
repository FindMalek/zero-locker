"use client"

import { orpc } from "@/orpc/client"
import type { ListTagsInput } from "@/schemas/utils/dto"
import { useQuery } from "@tanstack/react-query"

// List tags with pagination
export function useTags(input: ListTagsInput = { page: 1, limit: 100 }) {
  return useQuery(
    orpc.tags.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}
