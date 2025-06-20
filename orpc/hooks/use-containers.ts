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

/**
 * Retrieves a single container by its ID using a React Query hook.
 *
 * The query is enabled only if a valid ID is provided.
 *
 * @param id - The unique identifier of the container to fetch
 * @returns The query result containing the container data
 */
export function useContainer(id: string) {
  return useQuery(
    orpc.containers.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

/**
 * Fetches a paginated list of containers using the provided pagination input.
 *
 * @param input - Pagination parameters for listing containers. Defaults to page 1 and limit 10.
 * @returns A React Query result containing the list of containers.
 */
export function useContainers(
  input: ListContainersInput = { page: 1, limit: 10 }
) {
  return useQuery(
    orpc.containers.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}

/**
 * Provides a mutation hook to create a new container and update the cache.
 *
 * On successful creation, the container list is invalidated and the new container is cached. Errors are logged to the console.
 * @returns A mutation object for creating containers.
 */
export function useCreateContainer() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.containers.create.mutationOptions({
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
    })
  )
}

/**
 * Provides a mutation hook to create a new container along with its secrets.
 *
 * On successful creation, invalidates the containers and secrets list queries and caches the new container. Logs errors to the console if the operation fails.
 * @returns A mutation object for creating a container with secrets.
 */
export function useCreateContainerWithSecrets() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.containers.createWithSecrets.mutationOptions({
      onSuccess: (result) => {
        if (result.success && result.container) {
          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: orpc.containers.list.key(),
          })
          queryClient.invalidateQueries({ queryKey: orpc.secrets.list.key() })

          // Add the new container to the cache if available
          if (result.container) {
            queryClient.setQueryData(
              orpc.containers.get.queryKey({
                input: { id: result.container.id },
              }),
              result.container
            )
          }
        }
      },
      onError: (error) => {
        console.error("Failed to create container with secrets:", error)
      },
    })
  )
}

/**
 * Provides a mutation hook to update an existing container with optimistic cache updates and rollback on error.
 *
 * On mutation, the cache is optimistically updated with the new input. If the update fails, the cache is restored to its previous state. On success, the cache is updated with the server response and the container list query is invalidated to ensure fresh data.
 *
 * @returns A mutation object for updating a container.
 */
export function useUpdateContainer() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.containers.update.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.containers.get.key({ input: { id: input.id } }),
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
    })
  )
}

/**
 * Provides a mutation hook to delete a container and manage cache updates optimistically.
 *
 * Removes the container from the cache before the server confirms deletion, restoring it if the operation fails. On success, invalidates the container list query to refresh data.
 *
 * @returns A mutation object for deleting containers.
 */
export function useDeleteContainer() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.containers.delete.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.containers.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousContainer = queryClient.getQueryData<ContainerOutput>(
          orpc.containers.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically remove from cache
        queryClient.removeQueries({
          queryKey: orpc.containers.get.key({ input: { id: input.id } }),
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
    })
  )
}
