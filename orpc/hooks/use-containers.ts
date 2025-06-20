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

// Query keys factory
export const containerKeys = {
  all: ["containers"] as const,
  lists: () => [...containerKeys.all, "list"] as const,
  list: (filters: Partial<ListContainersInput>) =>
    [...containerKeys.lists(), filters] as const,
  details: () => [...containerKeys.all, "detail"] as const,
  detail: (id: string) => [...containerKeys.details(), id] as const,
}

// Get single container
export function useContainer(id: string) {
  return useQuery({
    queryKey: containerKeys.detail(id),
    queryFn: () => orpc.containers.get.call({ id }),
    enabled: !!id,
  })
}

// List containers with pagination
export function useContainers(
  input: ListContainersInput = { page: 1, limit: 10 }
) {
  return useQuery({
    queryKey: containerKeys.list(input),
    queryFn: () => orpc.containers.list.call(input),
    placeholderData: (previousData) => previousData,
  })
}

// Create container mutation
export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateContainerInput) =>
      orpc.containers.create.call(input),
    onSuccess: (newContainer: ContainerOutput) => {
      // Invalidate and refetch container lists
      queryClient.invalidateQueries({ queryKey: containerKeys.lists() })

      // Add the new container to the cache
      queryClient.setQueryData(
        containerKeys.detail(newContainer.id),
        newContainer
      )
    },
    onError: (error) => {
      console.error("Failed to create container:", error)
    },
  })
}

// Create container with secrets mutation
export function useCreateContainerWithSecrets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: orpc.containers.createWithSecrets.call,
    onSuccess: (result) => {
      if (result.success && result.container) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: containerKeys.lists(),
        })
        queryClient.invalidateQueries({ queryKey: ["secrets", "list"] })

        // Add the new container to the cache if available
        if (result.container) {
          queryClient.setQueryData(
            containerKeys.detail(result.container.id),
            result.container
          )
        }
      }
    },
    onError: (error) => {
      console.error("Failed to create container with secrets:", error)
    },
  })
}

// Update container mutation
export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateContainerInput) =>
      orpc.containers.update.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: containerKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousContainer = queryClient.getQueryData<ContainerOutput>(
        containerKeys.detail(input.id)
      )

      // Optimistically update the cache
      if (previousContainer) {
        queryClient.setQueryData<ContainerOutput>(
          containerKeys.detail(input.id),
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
          containerKeys.detail(input.id),
          context.previousContainer
        )
      }
      console.error("Failed to update container:", error)
    },
    onSuccess: (updatedContainer: ContainerOutput) => {
      // Update the cache with the server response
      queryClient.setQueryData(
        containerKeys.detail(updatedContainer.id),
        updatedContainer
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: containerKeys.lists() })
    },
  })
}

// Delete container mutation
export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteContainerInput) =>
      orpc.containers.delete.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: containerKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousContainer = queryClient.getQueryData<ContainerOutput>(
        containerKeys.detail(input.id)
      )

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: containerKeys.detail(input.id),
      })

      return { previousContainer }
    },
    onError: (error, input, context) => {
      // Restore the cache if deletion failed
      if (context?.previousContainer) {
        queryClient.setQueryData(
          containerKeys.detail(input.id),
          context.previousContainer
        )
      }
      console.error("Failed to delete container:", error)
    },
    onSuccess: () => {
      // Invalidate and refetch container lists
      queryClient.invalidateQueries({ queryKey: containerKeys.lists() })
    },
  })
}
