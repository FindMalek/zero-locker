"use client"

import { orpc } from "@/orpc/client"
import type {
  CreateCredentialInput,
  CredentialOutput,
  DeleteCredentialInput,
  ListCredentialsInput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Get single credential
export function useCredential(id: string) {
  return useQuery(
    orpc.credentials.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

// List credentials with pagination
export function useCredentials(
  input: ListCredentialsInput = { page: 1, limit: 10 }
) {
  return useQuery(
    orpc.credentials.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}

// Create credential mutation
export function useCreateCredential() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.credentials.create.mutationOptions({
      onSuccess: (newCredential) => {
        // Invalidate and refetch credential lists
        queryClient.invalidateQueries({ queryKey: orpc.credentials.list.key() })

        // Add the new credential to the cache
        queryClient.setQueryData(
          orpc.credentials.get.queryKey({ input: { id: newCredential.id } }),
          newCredential
        )
      },
      onError: (error) => {
        console.error("Failed to create credential:", error)
      },
    })
  )
}

// Create credential with metadata mutation
export function useCreateCredentialWithMetadata() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.credentials.createWithMetadata.mutationOptions({
      onSuccess: (result) => {
        if (result.success && result.credential) {
          // Invalidate and refetch credential lists
          queryClient.invalidateQueries({
            queryKey: orpc.credentials.list.key(),
          })

          // Add the new credential to the cache
          queryClient.setQueryData(
            orpc.credentials.get.queryKey({
              input: { id: result.credential.id },
            }),
            result.credential
          )
        }
      },
      onError: (error) => {
        console.error("Failed to create credential with metadata:", error)
      },
    })
  )
}

// Update credential mutation
export function useUpdateCredential() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.credentials.update.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.credentials.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousCredential = queryClient.getQueryData<CredentialOutput>(
          orpc.credentials.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically update the cache
        if (previousCredential) {
          queryClient.setQueryData<CredentialOutput>(
            orpc.credentials.get.queryKey({ input: { id: input.id } }),
            {
              ...previousCredential,
              ...input,
            }
          )
        }

        return { previousCredential }
      },
      onError: (error, input, context) => {
        // Rollback the cache to the previous value
        if (context?.previousCredential) {
          queryClient.setQueryData(
            orpc.credentials.get.queryKey({ input: { id: input.id } }),
            context.previousCredential
          )
        }
        console.error("Failed to update credential:", error)
      },
      onSuccess: (updatedCredential) => {
        // Update the cache with the server response
        queryClient.setQueryData(
          orpc.credentials.get.queryKey({
            input: { id: updatedCredential.id },
          }),
          updatedCredential
        )

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: orpc.credentials.list.key() })
      },
    })
  )
}

// Delete credential mutation
export function useDeleteCredential() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.credentials.delete.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.credentials.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousCredential = queryClient.getQueryData<CredentialOutput>(
          orpc.credentials.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically remove from cache
        queryClient.removeQueries({
          queryKey: orpc.credentials.get.key({ input: { id: input.id } }),
        })

        return { previousCredential }
      },
      onError: (error, input, context) => {
        // Restore the cache if deletion failed
        if (context?.previousCredential) {
          queryClient.setQueryData(
            orpc.credentials.get.queryKey({ input: { id: input.id } }),
            context.previousCredential
          )
        }
        console.error("Failed to delete credential:", error)
      },
      onSuccess: () => {
        // Invalidate and refetch credential lists
        queryClient.invalidateQueries({ queryKey: orpc.credentials.list.key() })
      },
    })
  )
}
