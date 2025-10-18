import { useMutation } from "@tanstack/react-query"

interface TestRateLimitInput {
  message?: string
}

interface TestRateLimitResponse {
  success: boolean
  message: string
  timestamp: number
  ip?: string
}

export function useTestRateLimit() {
  return useMutation<TestRateLimitResponse, Error, TestRateLimitInput>({
    mutationFn: async (input) => {
      const response = await fetch("/api/orpc/test.testRateLimit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.message || "Request failed")
        // Attach the full response data to the error for better handling
        ;(error as any).response = data
        ;(error as any).status = response.status
        throw error
      }

      return data
    },
  })
}

export const testKeys = {
  all: ["test"] as const,
  rateLimit: () => [...testKeys.all, "rateLimit"] as const,
}
