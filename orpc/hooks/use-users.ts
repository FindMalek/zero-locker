"use client"

import { orpc } from "@/orpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Join waitlist mutation
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

// Get waitlist count
export function useWaitlistCount() {
  return useQuery(
    orpc.users.getWaitlistCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}

// Get user count
export function useUserCount() {
  return useQuery(
    orpc.users.getUserCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}

// Get encrypted data count
export function useEncryptedDataCount() {
  return useQuery(
    orpc.users.getEncryptedDataCount.queryOptions({
      input: {},
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}
