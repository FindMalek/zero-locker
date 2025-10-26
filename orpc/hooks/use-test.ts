import { orpc } from "@/orpc/client"
import { useMutation } from "@tanstack/react-query"

// Test rate limit endpoint
export function useTestRateLimit() {
  return useMutation({
    mutationFn: orpc.test.testRateLimit.call,
    onError: (error) => {
      console.error("Failed to test rate limit:", error)
    },
  })
}
