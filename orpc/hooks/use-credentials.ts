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

/**
 * Retrieves a single credential by its ID using a React Query hook.
 *
 * The query is enabled only if a valid ID is provided.
 *
 * @param id - The unique identifier of the credential to fetch
 * @returns The React Query result containing the credential data
 */
export function useCredential(id: string) {
  return useQuery(
    orpc.credentials.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

/**
 * Fetches a paginated list of credentials, using previous data as a placeholder to maintain UI stability during loading.
 *
 * @param input - Optional pagination parameters for listing credentials
 * @returns A React Query result containing the list of credentials
 */
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

/**
 * Provides a mutation hook to create a new credential.
 *
 * On successful creation, the credential list is invalidated and the new credential is cached for immediate access.
 * Errors during creation are logged to the console.
 *
 * @returns A mutation object for creating credentials.
 */
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

/**
 * Provides a mutation hook to create a new credential with additional metadata.
 *
 * On successful creation, the credential list is invalidated and the new credential is cached. Errors during creation are logged.
 * @returns A mutation object for creating a credential with metadata.
 */
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

/**
 * Provides a mutation hook to update an existing credential with optimistic cache updates and rollback on error.
 *
 * Optimistically updates the cached credential data before the server response, rolling back to the previous state if the update fails. On success, updates the cache with the server response and invalidates the credential list to ensure data consistency.
 *
 * @returns A mutation object for updating credentials, including status and mutation methods.
 */
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

/**
 * Provides a mutation hook to delete a credential by ID with optimistic cache updates and rollback on error.
 *
 * Optimistically removes the credential from the cache before the server confirms deletion. If the deletion fails, the previous credential state is restored. On successful deletion, the credential list cache is invalidated to ensure updated data.
 *
 * @returns A mutation object for deleting a credential.
 */
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
