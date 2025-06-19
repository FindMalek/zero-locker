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

// Get single card
export function useCard(id: string) {
  return useQuery(orpc.cards.get.queryOptions({
    input: { id },
    enabled: !!id,
  }))
}

// List cards with pagination
export function useCards(input: ListCardsInput = { page: 1, limit: 10 }) {
  return useQuery(orpc.cards.list.queryOptions({
    input,
    placeholderData: (previousData) => previousData,
  }))
}

// Create card mutation
export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation(orpc.cards.create.mutationOptions({
    onSuccess: (newCard) => {
      // Invalidate and refetch card lists
      queryClient.invalidateQueries({ queryKey: orpc.cards.list.key() })

      // Add the new card to the cache
      queryClient.setQueryData(orpc.cards.get.queryKey({ input: { id: newCard.id } }), newCard)
    },
    onError: (error) => {
      console.error("Failed to create card:", error)
    },
  }))
}

// Update card mutation
export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation(orpc.cards.update.mutationOptions({
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orpc.cards.get.key({ input: { id: input.id } }) })

      // Snapshot the previous value
      const previousCard = queryClient.getQueryData<CardOutput>(
        orpc.cards.get.queryKey({ input: { id: input.id } })
      )

      // Optimistically update the cache
      if (previousCard) {
        const { expiryDate, ...safeInput } = input
        queryClient.setQueryData<CardOutput>(orpc.cards.get.queryKey({ input: { id: input.id } }), {
          ...previousCard,
          ...safeInput,
          ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        })
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
      queryClient.setQueryData(orpc.cards.get.queryKey({ input: { id: updatedCard.id } }), updatedCard)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: orpc.cards.list.key() })
    },
  }))
}

// Delete card mutation
export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation(orpc.cards.delete.mutationOptions({
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orpc.cards.get.key({ input: { id: input.id } }) })

      // Snapshot the previous value
      const previousCard = queryClient.getQueryData<CardOutput>(
        orpc.cards.get.queryKey({ input: { id: input.id } })
      )

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: orpc.cards.get.key({ input: { id: input.id } }) })

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
  }))
}
