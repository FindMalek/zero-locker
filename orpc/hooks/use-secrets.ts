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

// Get single secret
export function useSecret(id: string) {
  return useQuery(
    orpc.secrets.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

// List secrets with pagination
export function useSecrets(input: ListSecretsInput = { page: 1, limit: 10 }) {
  return useQuery(
    orpc.secrets.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}

// Create secret mutation
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

// Update secret mutation
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

// Delete secret mutation
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
