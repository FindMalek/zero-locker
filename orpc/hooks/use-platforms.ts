"use client"

import { orpc } from "@/orpc/client"
import type { ListPlatformsInput } from "@/schemas/utils/dto"
import { useQuery } from "@tanstack/react-query"

/**
 * React hook to fetch and cache a paginated list of platforms.
 *
 * @param input - Optional pagination parameters; defaults to page 1 and limit 100
 * @returns The result of the query, including platform data and query status
 */
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
