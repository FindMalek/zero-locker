"use client"

import { orpc } from "@/orpc/client"
import type {
  ContainerOutput,
  CreateContainerInput,
  DeleteContainerInput,
  ListContainersInput,
  UpdateContainerInput,
} from "@/schemas/utils/dto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Get single container
export function useContainer(id: string) {
  return useQuery(orpc.containers.get.queryOptions({
    input: { id },
    enabled: !!id,
  }))
}

// List containers with pagination
export function useContainers(input: ListContainersInput = { page: 1, limit: 10 }) {
  return useQuery(orpc.containers.list.queryOptions({
    input,
    placeholderData: (previousData) => previousData,
  }))
}

// Create container mutation
export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation(orpc.containers.create.mutationOptions({
    onSuccess: (newContainer) => {
      // Invalidate and refetch container lists
      queryClient.invalidateQueries({ queryKey: orpc.containers.list.key() })

      // Add the new container to the cache
      queryClient.setQueryData(
        orpc.containers.get.queryKey({ input: { id: newContainer.id } }),
        newContainer
      )
    },
    onError: (error) => {
      console.error("Failed to create container:", error)
    },
  }))
}

// Update container mutation
export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation(orpc.containers.update.mutationOptions({
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: orpc.containers.get.key({ input: { id: input.id } })
      })

      // Snapshot the previous value
      const previousContainer = queryClient.getQueryData<ContainerOutput>(
        orpc.containers.get.queryKey({ input: { id: input.id } })
      )

      // Optimistically update the cache
      if (previousContainer) {
        queryClient.setQueryData<ContainerOutput>(
          orpc.containers.get.queryKey({ input: { id: input.id } }),
          {
            ...previousContainer,
            ...input,
          }
        )
      }

      return { previousContainer }
    },
    onError: (error, input, context) => {
      // Rollback the cache to the previous value
      if (context?.previousContainer) {
        queryClient.setQueryData(
          orpc.containers.get.queryKey({ input: { id: input.id } }),
          context.previousContainer
        )
      }
      console.error("Failed to update container:", error)
    },
    onSuccess: (updatedContainer) => {
      // Update the cache with the server response
      queryClient.setQueryData(
        orpc.containers.get.queryKey({ input: { id: updatedContainer.id } }),
        updatedContainer
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: orpc.containers.list.key() })
    },
  }))
}

// Delete container mutation
export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation(orpc.containers.delete.mutationOptions({
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: orpc.containers.get.key({ input: { id: input.id } })
      })

      // Snapshot the previous value
      const previousContainer = queryClient.getQueryData<ContainerOutput>(
        orpc.containers.get.queryKey({ input: { id: input.id } })
      )

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: orpc.containers.get.key({ input: { id: input.id } })
      })

      return { previousContainer }
    },
    onError: (error, input, context) => {
      // Restore the cache if deletion failed
      if (context?.previousContainer) {
        queryClient.setQueryData(
          orpc.containers.get.queryKey({ input: { id: input.id } }),
          context.previousContainer
        )
      }
      console.error("Failed to delete container:", error)
    },
    onSuccess: () => {
      // Invalidate and refetch container lists
      queryClient.invalidateQueries({ queryKey: orpc.containers.list.key() })
    },
  }))
} 