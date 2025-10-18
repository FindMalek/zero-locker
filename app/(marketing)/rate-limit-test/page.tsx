"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { orpc } from "@/orpc/client"

interface RateLimitStats {
  endpoint: string
  limit: number
  remaining: number
  resetAt: number
  lastError?: string
}

export default function RateLimitTestPage() {
  const [stats, setStats] = useState<RateLimitStats[]>([])
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const testEndpoint = async (
    endpoint: "getUserCount" | "getWaitlistCount" | "getEncryptedDataCount",
    label: string,
    limit: number
  ) => {
    setIsLoading((prev) => ({ ...prev, [endpoint]: true }))

    try {
      await orpc.users[endpoint]({})

      // Update stats on success
      setStats((prev) => {
        const existing = prev.find((s) => s.endpoint === endpoint)
        if (existing) {
          return prev.map((s) =>
            s.endpoint === endpoint
              ? {
                  ...s,
                  remaining: Math.max(0, s.remaining - 1),
                  lastError: undefined,
                }
              : s
          )
        }
        return [
          ...prev,
          {
            endpoint: label,
            limit,
            remaining: limit - 1,
            resetAt: Date.now() + 60000,
            lastError: undefined,
          },
        ]
      })

      toast.success(`${label} - Request successful`, {
        description: "Rate limit not exceeded",
      })
    } catch (error: unknown) {
      // Extract error details
      let errorMessage = "Unknown error"
      let retryAfter = 60

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message)
      }

      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "retryAfter" in error.data
      ) {
        retryAfter = Number(error.data.retryAfter)
      }

      // Update stats on error
      setStats((prev) => {
        const existing = prev.find((s) => s.endpoint === label)
        if (existing) {
          return prev.map((s) =>
            s.endpoint === label
              ? {
                  ...s,
                  remaining: 0,
                  lastError: errorMessage,
                  resetAt: Date.now() + retryAfter * 1000,
                }
              : s
          )
        }
        return [
          ...prev,
          {
            endpoint: label,
            limit,
            remaining: 0,
            resetAt: Date.now() + retryAfter * 1000,
            lastError: errorMessage,
          },
        ]
      })

      toast.error(`${label} - Rate limit exceeded`, {
        description: `Retry after ${retryAfter} seconds`,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [endpoint]: false }))
    }
  }

  const testStrictEndpoint = async () => {
    setIsLoading((prev) => ({ ...prev, strict: true }))

    try {
      await orpc.users.joinWaitlist({
        email: `test-${Date.now()}@example.com`,
      })

      setStats((prev) => {
        const existing = prev.find((s) => s.endpoint === "Join Waitlist (Strict)")
        if (existing) {
          return prev.map((s) =>
            s.endpoint === "Join Waitlist (Strict)"
              ? {
                  ...s,
                  remaining: Math.max(0, s.remaining - 1),
                  lastError: undefined,
                }
              : s
          )
        }
        return [
          ...prev,
          {
            endpoint: "Join Waitlist (Strict)",
            limit: 5,
            remaining: 4,
            resetAt: Date.now() + 60000,
            lastError: undefined,
          },
        ]
      })

      toast.success("Strict endpoint - Request successful")
    } catch (error: unknown) {
      let errorMessage = "Unknown error"
      let retryAfter = 60

      if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message)
      }

      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "retryAfter" in error.data
      ) {
        retryAfter = Number(error.data.retryAfter)
      }

      setStats((prev) => {
        const existing = prev.find(
          (s) => s.endpoint === "Join Waitlist (Strict)"
        )
        if (existing) {
          return prev.map((s) =>
            s.endpoint === "Join Waitlist (Strict)"
              ? {
                  ...s,
                  remaining: 0,
                  lastError: errorMessage,
                  resetAt: Date.now() + retryAfter * 1000,
                }
              : s
          )
        }
        return [
          ...prev,
          {
            endpoint: "Join Waitlist (Strict)",
            limit: 5,
            remaining: 0,
            resetAt: Date.now() + retryAfter * 1000,
            lastError: errorMessage,
          },
        ]
      })

      toast.error("Strict endpoint - Rate limit exceeded", {
        description: `Retry after ${retryAfter} seconds`,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, strict: false }))
    }
  }

  const clearStats = () => {
    setStats([])
    toast.success("Stats cleared")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Rate Limit Testing
          </h1>
          <p className="text-muted-foreground">
            Test the IP-based rate limiting on public API endpoints. Click the
            buttons repeatedly to trigger rate limits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Lenient Rate Limit Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Lenient Rate Limit (100/min)</CardTitle>
              <CardDescription>
                Public read-only endpoints with high traffic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() =>
                  testEndpoint("getUserCount", "User Count", 100)
                }
                disabled={isLoading.getUserCount}
                className="w-full"
              >
                {isLoading.getUserCount ? "Testing..." : "Test User Count"}
              </Button>
              <Button
                onClick={() =>
                  testEndpoint(
                    "getWaitlistCount",
                    "Waitlist Count",
                    100
                  )
                }
                disabled={isLoading.getWaitlistCount}
                className="w-full"
              >
                {isLoading.getWaitlistCount
                  ? "Testing..."
                  : "Test Waitlist Count"}
              </Button>
              <Button
                onClick={() =>
                  testEndpoint(
                    "getEncryptedDataCount",
                    "Encrypted Data Count",
                    100
                  )
                }
                disabled={isLoading.getEncryptedDataCount}
                className="w-full"
              >
                {isLoading.getEncryptedDataCount
                  ? "Testing..."
                  : "Test Encrypted Data Count"}
              </Button>
            </CardContent>
          </Card>

          {/* Strict Rate Limit Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Strict Rate Limit (5/min)</CardTitle>
              <CardDescription>
                Sensitive endpoints that send emails or perform write operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testStrictEndpoint}
                disabled={isLoading.strict}
                variant="destructive"
                className="w-full"
              >
                {isLoading.strict ? "Testing..." : "Test Join Waitlist"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Click this button 6 times rapidly to trigger the rate limit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Display */}
        {stats.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rate Limit Statistics</CardTitle>
                <CardDescription>
                  Current rate limit status for tested endpoints
                </CardDescription>
              </div>
              <Button onClick={clearStats} variant="outline" size="sm">
                Clear Stats
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats.map((stat, index) => (
                <div key={stat.endpoint} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stat.endpoint}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.remaining}/{stat.limit} remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Resets in{" "}
                        {Math.max(
                          0,
                          Math.floor((stat.resetAt - Date.now()) / 1000)
                        )}
                        s
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(stat.remaining / stat.limit) * 100}
                    className="h-2"
                  />
                  {stat.lastError && (
                    <p className="text-sm text-destructive">{stat.lastError}</p>
                  )}
                  {index < stats.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground">
                IP-Based Rate Limiting
              </h3>
              <p>
                Each endpoint has its own rate limit based on the IP address of
                the requester. The system tracks requests per IP and enforces
                limits based on the endpoint&apos;s sensitivity.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">Rate Limit Types</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  <strong>Strict (5/min):</strong> For email sending and write
                  operations
                </li>
                <li>
                  <strong>Moderate (30/min):</strong> For general public
                  endpoints
                </li>
                <li>
                  <strong>Lenient (100/min):</strong> For read-only high-traffic
                  endpoints
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                Production Considerations
              </h3>
              <p>
                In production, this in-memory cache should be replaced with Redis
                for consistency across multiple server instances. The current
                implementation works for single-server deployments or
                development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

