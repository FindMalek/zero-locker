import { orpc } from "@/orpc/client"
import { useMutation } from "@tanstack/react-query"

// Test rate limit endpoints
export function useTestRateLimit() {
  return useMutation({
    mutationFn: orpc.test.testRateLimit.call,
    onError: (error) => {
      console.error("Failed to test rate limit:", error)
    },
  })
}

export function useTestStrictRateLimit() {
  return useMutation({
    mutationFn: orpc.test.testStrictRateLimit.call,
    onError: (error) => {
      console.error("Failed to test strict rate limit:", error)
    },
  })
}

export function useTestModerateRateLimit() {
  return useMutation({
    mutationFn: orpc.test.testModerateRateLimit.call,
    onError: (error) => {
      console.error("Failed to test moderate rate limit:", error)
    },
  })
}
