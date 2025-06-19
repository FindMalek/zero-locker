import { QueryClient } from "@tanstack/react-query"

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long until data is considered stale
        staleTime: 60 * 1000, // 1 minute
        // Cache time - how long to keep data in cache after it's unused
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        // Retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (
            error?.data?.code === "UNAUTHORIZED" ||
            error?.data?.code === "FORBIDDEN"
          ) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        // Refetch on window focus for important data
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  })
}

// Singleton instance for client-side
let queryClient: QueryClient | undefined

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return createQueryClient()
  }

  // Client: create a new query client if we don't have one
  if (!queryClient) {
    queryClient = createQueryClient()
  }

  return queryClient
}
