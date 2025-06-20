"use client"

import { orpc } from "@/orpc/client"
import type { ListTagsInput } from "@/schemas/utils/dto"
import { useQuery } from "@tanstack/react-query"

// Query keys factory
export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (filters: Partial<ListTagsInput>) =>
    [...tagKeys.lists(), filters] as const,
}

// List tags with pagination
export function useTags(input: ListTagsInput = { page: 1, limit: 100 }) {
  return useQuery({
    queryKey: tagKeys.list(input),
    queryFn: () => orpc.tags.list.call(input),
    placeholderData: (previousData) => previousData,
  })
}
