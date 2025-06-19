"use client"

import { orpc } from "@/orpc/client"
import type { ListPlatformsInput } from "@/schemas/utils/dto"
import { useQuery } from "@tanstack/react-query"

// List platforms with pagination
export function usePlatforms(
  input: ListPlatformsInput = { page: 1, limit: 100 }
) {
  return useQuery(
    orpc.platforms.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}
