"use client"

import { orpc } from "@/orpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Returns a mutation hook for joining the user waitlist.
 *
 * On successful mutation, the waitlist count query is invalidated to trigger a refetch.
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.users.joinWaitlist.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          // Invalidate waitlist count to refetch
          queryClient.invalidateQueries({
            queryKey: orpc.users.getWaitlistCount.key(),
          })
        }
      },
      onError: (error) => {
        console.error("Failed to join waitlist:", error)
      },
    })
  )
}

/**
 * Returns a React Query hook that fetches the current waitlist count from the server.
 *
 * The query result is cached and considered fresh for 5 minutes.
 */
export function useWaitlistCount() {
  return useQuery(
    orpc.users.getWaitlistCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}

/**
 * Returns a React Query hook that fetches the total number of users from the server.
 *
 * The query result is cached and considered fresh for 5 minutes.
 */
export function useUserCount() {
  return useQuery(
    orpc.users.getUserCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}

/**
 * Returns a React Query hook that fetches the count of encrypted data entries from the server.
 *
 * The query result is cached and considered fresh for 5 minutes.
 */
export function useEncryptedDataCount() {
  return useQuery(
    orpc.users.getEncryptedDataCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}
