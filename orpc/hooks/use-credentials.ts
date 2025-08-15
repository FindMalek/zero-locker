"use client"

import { orpc } from "@/orpc/client"
import type {
  CreateCredentialInput,
  CredentialOutput,
  DeleteCredentialInput,
  ListCredentialsInput,
  ListCredentialsOutput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

// Query keys factory
export const credentialKeys = {
  all: ["credentials"] as const,
  lists: () => [...credentialKeys.all, "list"] as const,
  list: (filters: Partial<ListCredentialsInput>) =>
    [...credentialKeys.lists(), filters] as const,
  details: () => [...credentialKeys.all, "detail"] as const,
  detail: (id: string) => [...credentialKeys.details(), id] as const,
}

// Get single credential
export function useCredential(
  id: string,
  options?: Omit<UseQueryOptions<CredentialOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: credentialKeys.detail(id),
    queryFn: () => orpc.credentials.get.call({ id }),
    enabled: !!id,
    ...options,
  })
}

// Get credential password (decrypted server-side)
export function useCredentialPassword(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: [...credentialKeys.detail(id), "password"],
    queryFn: () => orpc.credentials.getPassword.call({ id }),
    enabled: !!id && enabled,
    staleTime: 0, // Always fetch fresh for security
    gcTime: 0, // Don't cache passwords
  })
}

// Get credential security settings (decrypted server-side)
export function useCredentialSecuritySettings(
  id: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...credentialKeys.detail(id), "security-settings"],
    queryFn: () => orpc.credentials.getSecuritySettings.call({ id }),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

// Get credential key-value pairs (keys only, no values for security)
export function useCredentialKeyValuePairs(
  id: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [...credentialKeys.detail(id), "key-value-pairs"],
    queryFn: () => orpc.credentials.getKeyValuePairs.call({ id }),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  })
}

// Get specific key-value pair value (for viewing with eye icon)
export function useCredentialKeyValuePairValue(
  credentialId: string,
  keyValuePairId: string,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: [
      ...credentialKeys.detail(credentialId),
      "key-value-pair-value",
      keyValuePairId,
    ],
    queryFn: () =>
      orpc.credentials.getKeyValuePairValue.call({
        credentialId,
        keyValuePairId,
      }),
    enabled: !!credentialId && !!keyValuePairId && enabled,
    staleTime: 0, // Always fetch fresh for security
    gcTime: 0, // Don't cache values
  })
}

// List credentials with pagination
export function useCredentials(
  input: ListCredentialsInput = { page: 1, limit: 10 },
  options?: Omit<UseQueryOptions<ListCredentialsOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: credentialKeys.list(input),
    queryFn: () => orpc.credentials.list.call(input),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Create credential mutation
export function useCreateCredential() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCredentialInput) =>
      orpc.credentials.create.call(input),
    onSuccess: (newCredential: CredentialOutput) => {
      // Invalidate and refetch credential lists
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })

      // Add the new credential to the cache
      queryClient.setQueryData(
        credentialKeys.detail(newCredential.id),
        newCredential
      )
    },
    onError: (error) => {
      console.error("Failed to create credential:", error)
    },
  })
}

// Create credential with metadata mutation
export function useCreateCredentialWithMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orpc.credentials.createWithMetadata.call,
    onSuccess: (result) => {
      if (result.success && result.credential) {
        // Invalidate and refetch credential lists
        queryClient.invalidateQueries({
          queryKey: credentialKeys.lists(),
        })

        // Add the new credential to the cache
        queryClient.setQueryData(
          credentialKeys.detail(result.credential.id),
          result.credential
        )
      }
    },
    onError: (error) => {
      console.error("Failed to create credential with metadata:", error)
    },
  })
}

// Update credential mutation
export function useUpdateCredential() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCredentialInput) =>
      orpc.credentials.update.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: credentialKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousCredential = queryClient.getQueryData<CredentialOutput>(
        credentialKeys.detail(input.id)
      )

      // Optimistically update the cache
      if (previousCredential) {
        queryClient.setQueryData<CredentialOutput>(
          credentialKeys.detail(input.id),
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
          credentialKeys.detail(input.id),
          context.previousCredential
        )
      }
      console.error("Failed to update credential:", error)
    },
    onSuccess: (updatedCredential: CredentialOutput) => {
      // Update the cache with the server response
      queryClient.setQueryData(
        credentialKeys.detail(updatedCredential.id),
        updatedCredential
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
    },
  })
}

// Update credential with security settings mutation
export function useUpdateCredentialWithSecuritySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orpc.credentials.updateWithSecuritySettings.call,
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: credentialKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousCredential = queryClient.getQueryData<CredentialOutput>(
        credentialKeys.detail(input.id)
      )

      return { previousCredential }
    },
    onError: (error, input, context) => {
      // Rollback the cache to the previous value
      if (context?.previousCredential) {
        queryClient.setQueryData(
          credentialKeys.detail(input.id),
          context.previousCredential
        )
      }
      console.error(
        "Failed to update credential with security settings:",
        error
      )
    },
    onSuccess: (updatedCredential: CredentialOutput, variables) => {
      // Update the cache with the server response
      queryClient.setQueryData(
        credentialKeys.detail(updatedCredential.id),
        updatedCredential
      )

      // Invalidate related queries including security settings
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: [...credentialKeys.detail(variables.id), "security-settings"],
      })
    },
  })
}

// Update credential key-value pairs mutation
export function useUpdateCredentialKeyValuePairs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orpc.credentials.updateKeyValuePairs.call,
    onSuccess: (_, variables) => {
      // Invalidate key-value pairs cache
      queryClient.invalidateQueries({
        queryKey: [
          ...credentialKeys.detail(variables.credentialId),
          "key-value-pairs",
        ],
      })
    },
    onError: (error) => {
      console.error("Failed to update credential key-value pairs:", error)
    },
  })
}

// Delete credential mutation
export function useDeleteCredential() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteCredentialInput) =>
      orpc.credentials.delete.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: credentialKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousCredential = queryClient.getQueryData<CredentialOutput>(
        credentialKeys.detail(input.id)
      )

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: credentialKeys.detail(input.id),
      })

      return { previousCredential }
    },
    onError: (error, input, context) => {
      // Restore the cache if deletion failed
      if (context?.previousCredential) {
        queryClient.setQueryData(
          credentialKeys.detail(input.id),
          context.previousCredential
        )
      }
      console.error("Failed to delete credential:", error)
    },
    onSuccess: () => {
      // Invalidate and refetch credential lists
      queryClient.invalidateQueries({ queryKey: credentialKeys.lists() })
    },
  })
}
