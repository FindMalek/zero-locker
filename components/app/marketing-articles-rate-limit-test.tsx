"use client"

import { useState } from "react"
import { useTestRateLimit } from "@/orpc/hooks/use-test"
import { toast } from "sonner"
import { parseRetryTime } from "@/lib/utils/rate-limit"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MarketingArticlesRateLimitTestProps {
  endpoint: "strict" | "moderate"
  maxRequests: number
  description: string
}

interface RequestLog {
  id: string
  timestamp: Date
  success: boolean
  error?: string
  remaining?: number
  retryAfter?: number
}

export function MarketingArticlesRateLimitTest({
  endpoint,
  maxRequests,
  description,
}: MarketingArticlesRateLimitTestProps) {
  const [requestCount, setRequestCount] = useState(0)
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([])

  const testMutation = useTestRateLimit()

  const handleTest = () => {
    testMutation.mutate(
      {
        endpoint,
      },
      {
        onSuccess: (data) => {
          setRequestCount((prev) => prev + 1)
          setRequestLogs((prev) => [
            {
              id: Date.now().toString(),
              timestamp: new Date(),
              success: true,
              remaining: data.remaining,
            },
            ...prev.slice(0, 9), // Keep only last 10 logs
          ])

          toast.success(
            `Request ${requestCount + 1} successful! ${data.remaining} requests remaining`
          )
        },
        onError: (error: Error) => {
          setRequestCount((prev) => prev + 1)
          const retryAfter = parseRetryTime(error.message)

          setRequestLogs((prev) => [
            {
              id: Date.now().toString(),
              timestamp: new Date(),
              success: false,
              error: error.message,
              retryAfter,
            },
            ...prev.slice(0, 9), // Keep only last 10 logs
          ])

          toast.error(`Request ${requestCount + 1} failed: ${error.message}`)
        },
      }
    )
  }

  const resetTest = () => {
    setRequestCount(0)
    setRequestLogs([])
    toast.info("Test reset - try again!")
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <Icons.check className="size-3" />
    ) : (
      <Icons.close className="size-3" />
    )
  }

  const getEndpointColor = (endpoint: string) => {
    return endpoint === "strict"
      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
  }

  const progressPercentage = Math.min((requestCount / maxRequests) * 100, 100)
  const isNearLimit = requestCount >= maxRequests * 0.8
  const isAtLimit = requestCount >= maxRequests

  return (
    <Card className="border-muted-foreground/20 my-8 border-2 border-dashed">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Icons.shield className="text-primary size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Rate Limit Test</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className={getEndpointColor(endpoint)}>
            {endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.barChart className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">Request Progress</span>
            </div>
            <div className="text-muted-foreground text-sm">
              {requestCount} / {maxRequests}
            </div>
          </div>

          <div className="space-y-2">
            <Progress
              value={progressPercentage}
              className={`h-2 ${isAtLimit ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : "bg-green-100"}`}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>0</span>
              <span
                className={
                  isAtLimit
                    ? "font-medium text-red-600"
                    : isNearLimit
                      ? "font-medium text-yellow-600"
                      : ""
                }
              >
                {isAtLimit
                  ? "Rate Limited!"
                  : isNearLimit
                    ? "Approaching Limit"
                    : "Safe Zone"}
              </span>
              <span>{maxRequests}</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleTest}
            disabled={testMutation.isPending}
            variant={isAtLimit ? "destructive" : "default"}
            className="flex items-center gap-2"
            size="lg"
          >
            {testMutation.isPending && (
              <Icons.spinner className="size-4 animate-spin" />
            )}
            <Icons.arrowRight className="size-4" />
            Send Request
          </Button>

          <Button
            onClick={resetTest}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Icons.refresh className="size-4" />
            Reset
          </Button>
        </div>

        {/* Request Logs */}
        {requestLogs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icons.barChart className="text-muted-foreground size-4" />
              <h4 className="text-sm font-medium">Recent Requests</h4>
              <Badge variant="outline" className="text-xs">
                {requestLogs.length}
              </Badge>
            </div>

            <div className="bg-muted/50 max-h-40 overflow-y-auto rounded-lg border p-3">
              <div className="space-y-2">
                {requestLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      log.success
                        ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100"
                        : "bg-red-50 text-red-900 dark:bg-red-950/20 dark:text-red-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.success)}
                      <span className="text-muted-foreground font-mono text-xs">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex-1">
                      {log.success ? (
                        <span className="font-medium">
                          Success • {log.remaining} remaining
                        </span>
                      ) : (
                        <span className="font-medium">
                          Rate Limited • {log.error}
                        </span>
                      )}
                    </div>

                    {log.retryAfter && (
                      <Badge variant="outline" className="text-xs">
                        Retry in {log.retryAfter}s
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        {requestCount > 0 && (
          <div
            className={`rounded-lg p-4 ${
              isAtLimit
                ? "border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                : isNearLimit
                  ? "border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
                  : "border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {isAtLimit ? (
                <Icons.warning className="size-4 text-red-600" />
              ) : isNearLimit ? (
                <Icons.warning className="size-4 text-yellow-600" />
              ) : (
                <Icons.check className="size-4 text-emerald-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  isAtLimit
                    ? "text-red-900 dark:text-red-100"
                    : isNearLimit
                      ? "text-yellow-900 dark:text-yellow-100"
                      : "text-emerald-900 dark:text-emerald-100"
                }`}
              >
                {isAtLimit
                  ? (() => {
                      const latestError = requestLogs.find(log => !log.success)
                      const retryTime = latestError?.retryAfter
                      return retryTime 
                        ? `Rate limit reached! Wait ${retryTime} seconds before trying again.`
                        : "Rate limit reached! Please wait before trying again."
                    })()
                  : isNearLimit
                    ? "Approaching rate limit. Be careful with your next requests."
                    : "All good! You can continue sending requests."}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
