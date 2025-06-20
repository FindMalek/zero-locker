"use client"

import { orpc } from "@/orpc/client"
import type {
  CardOutput,
  CreateCardInput,
  DeleteCardInput,
  ListCardsInput,
  ListCardsOutput,
  UpdateCardInput,
} from "@/schemas/card/dto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Query keys factory
export const cardKeys = {
  all: ["cards"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (filters: Partial<ListCardsInput>) =>
    [...cardKeys.lists(), filters] as const,
  details: () => [...cardKeys.all, "detail"] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
}

/**
 * Fetches a single card by its ID using React Query.
 *
 * The query is enabled only if a valid ID is provided.
 *
 * @param id - The unique identifier of the card to fetch
 * @returns The React Query result for the requested card
 */
export function useCard(id: string) {
  return useQuery(
    orpc.cards.get.queryOptions({
      input: { id },
      enabled: !!id,
    })
  )
}

/**
 * Fetches a paginated list of cards, optionally filtered by the provided input.
 *
 * @param input - Pagination and filter options for listing cards. Defaults to the first page with a limit of 10 cards.
 * @returns The query result containing the list of cards and pagination metadata.
 */
export function useCards(input: ListCardsInput = { page: 1, limit: 10 }) {
  return useQuery(
    orpc.cards.list.queryOptions({
      input,
      placeholderData: (previousData) => previousData,
    })
  )
}

/**
 * Returns a mutation hook for creating a new card.
 *
 * On success, invalidates cached card lists and adds the new card to the cache.
 */
export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.cards.create.mutationOptions({
      onSuccess: (newCard) => {
        // Invalidate and refetch card lists
        queryClient.invalidateQueries({ queryKey: orpc.cards.list.key() })

        // Add the new card to the cache
        queryClient.setQueryData(
          orpc.cards.get.queryKey({ input: { id: newCard.id } }),
          newCard
        )
      },
      onError: (error) => {
        console.error("Failed to create card:", error)
      },
    })
  )
}

/**
 * Returns a mutation hook for updating an existing card with optimistic cache updates.
 *
 * Performs an optimistic update of the card data in the cache before the server response, rolling back on error and updating with the server response on success. Also invalidates card list queries to ensure fresh data.
 *
 * @returns A mutation hook for updating card data.
 */
export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.cards.update.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.cards.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousCard = queryClient.getQueryData<CardOutput>(
          orpc.cards.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically update the cache
        if (previousCard) {
          const { expiryDate, ...safeInput } = input
          queryClient.setQueryData<CardOutput>(
            orpc.cards.get.queryKey({ input: { id: input.id } }),
            {
              ...previousCard,
              ...safeInput,
              ...(expiryDate && { expiryDate: new Date(expiryDate) }),
            }
          )
        }

        return { previousCard }
      },
      onError: (error, input, context) => {
        // Rollback the cache to the previous value
        if (context?.previousCard) {
          queryClient.setQueryData(
            orpc.cards.get.queryKey({ input: { id: input.id } }),
            context.previousCard
          )
        }
        console.error("Failed to update card:", error)
      },
      onSuccess: (updatedCard) => {
        // Update the cache with the server response
        queryClient.setQueryData(
          orpc.cards.get.queryKey({ input: { id: updatedCard.id } }),
          updatedCard
        )

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: orpc.cards.list.key() })
      },
    })
  )
}

/**
 * Provides a mutation hook to delete a card, performing optimistic cache removal and restoring the cache if the deletion fails.
 *
 * On successful deletion, invalidates cached card lists to ensure updated data is fetched.
 * If the deletion fails, restores the previously cached card data.
 *
 * @returns A mutation object for deleting a card by ID
 */
export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.cards.delete.mutationOptions({
      onMutate: async (input) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.cards.get.key({ input: { id: input.id } }),
        })

        // Snapshot the previous value
        const previousCard = queryClient.getQueryData<CardOutput>(
          orpc.cards.get.queryKey({ input: { id: input.id } })
        )

        // Optimistically remove from cache
        queryClient.removeQueries({
          queryKey: orpc.cards.get.key({ input: { id: input.id } }),
        })

        return { previousCard }
      },
      onError: (error, input, context) => {
        // Restore the cache if deletion failed
        if (context?.previousCard) {
          queryClient.setQueryData(
            orpc.cards.get.queryKey({ input: { id: input.id } }),
            context.previousCard
          )
        }
        console.error("Failed to delete card:", error)
      },
      onSuccess: () => {
        // Invalidate and refetch card lists
        queryClient.invalidateQueries({ queryKey: orpc.cards.list.key() })
      },
    })
  )
}
