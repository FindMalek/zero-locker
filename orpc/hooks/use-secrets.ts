"use client"

import { orpc } from "@/orpc/client"
import type {
  CreateSecretInput,
  DeleteSecretInput,
  ListSecretsInput,
  SecretOutput,
  UpdateSecretInput,
} from "@/schemas/secrets/dto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/**
 * Fetches a single secret by its ID using a React Query hook.
 *
 * The query is enabled only if a valid ID is provided.
 *
 * @param id - The unique identifier of the secret to fetch
 * @returns The React Query result for the requested secret
 */
export function useSecret(id: string) {
  return useQuery(
    orpc.secrets.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

/**
 * Fetches a paginated list of secrets, using previous data as a placeholder to maintain UI stability during refetches.
 *
 * @param input - Pagination parameters for listing secrets. Defaults to the first page with a limit of 10.
 * @returns The React Query result containing the list of secrets.
 */
export function useSecrets(input: ListSecretsInput = { page: 1, limit: 10 }) {
  return useQuery(
    orpc.secrets.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}

/**
 * Provides a mutation hook to create a new secret and update the cache on success.
 *
 * On successful creation, the secrets list is invalidated and the new secret is added to the cache.
 * Logs an error to the console if creation fails.
 * 
 * @returns A mutation object for creating a secret.
 */
export function useCreateSecret() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.secrets.create.mutationOptions({
      onSuccess: (newSecret) => {
        // Invalidate and refetch secret lists
        queryClient.invalidateQueries({ queryKey: orpc.secrets.list.key() })

        // Add the new secret to the cache
        queryClient.setQueryData(
          orpc.secrets.get.queryKey({ input: { id: newSecret.id } }),
          newSecret
        )
      },
      onError: (error) => {
        console.error("Failed to create secret:", error)
      },
    })
  )
}

/**
 * Provides a mutation hook to update an existing secret with optimistic cache updates and rollback on error.
 *
 * Optimistically updates the cached secret data before the server response, rolling back if the update fails. On success, updates the cache with the server response and invalidates the secrets list query to ensure data consistency.
 *
 * @returns A mutation object for updating a secret, including status and mutation methods.
 */
export function useUpdateSecret() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.secrets.update.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.secrets.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousSecret = queryClient.getQueryData<SecretOutput>(
          orpc.secrets.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically update the cache
        if (previousSecret) {
          queryClient.setQueryData<SecretOutput>(
            orpc.secrets.get.queryKey({ input: { id: input.id } }),
            {
              ...previousSecret,
              ...input,
            }
          )
        }

        return { previousSecret }
      },
      onError: (error, input, context) => {
        // Rollback the cache to the previous value
        if (context?.previousSecret) {
          queryClient.setQueryData(
            orpc.secrets.get.queryKey({ input: { id: input.id } }),
            context.previousSecret
          )
        }
        console.error("Failed to update secret:", error)
      },
      onSuccess: (updatedSecret) => {
        // Update the cache with the server response
        queryClient.setQueryData(
          orpc.secrets.get.queryKey({ input: { id: updatedSecret.id } }),
          updatedSecret
        )

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: orpc.secrets.list.key() })
      },
    })
  )
}

/**
 * Provides a mutation hook to delete a secret and manage cache updates optimistically.
 *
 * Optimistically removes the secret from the cache before the server confirms deletion, restores it if the deletion fails, and invalidates the secret list cache on success to ensure UI consistency.
 *
 * @returns A mutation object for deleting a secret.
 */
export function useDeleteSecret() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.secrets.delete.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.secrets.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousSecret = queryClient.getQueryData<SecretOutput>(
          orpc.secrets.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically remove from cache
        queryClient.removeQueries({
          queryKey: orpc.secrets.get.key({ input: { id: input.id } }),
        })

        return { previousSecret }
      },
      onError: (error, input, context) => {
        // Restore the cache if deletion failed
        if (context?.previousSecret) {
          queryClient.setQueryData(
            orpc.secrets.get.queryKey({ input: { id: input.id } }),
            context.previousSecret
          )
        }
        console.error("Failed to delete secret:", error)
      },
      onSuccess: () => {
        // Invalidate and refetch secret lists
        queryClient.invalidateQueries({ queryKey: orpc.secrets.list.key() })
      },
    })
  )
}
