"use client"

import { useState } from "react"
import { useTestRateLimit } from "@/orpc/hooks/use-test"
import { toast } from "sonner"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
        timestamp: new Date().toISOString(),
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
          const retryAfter = error.message.includes("45") ? 45 : undefined

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

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-500" : "text-red-500"
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <Icons.check className="size-3" />
    ) : (
      <Icons.close className="size-3" />
    )
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.shield className="size-5" />
          Rate Limit Test:{" "}
          {endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
        </CardTitle>
        <CardDescription>
          {description} - Limit: {maxRequests} requests/minute
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleTest}
            disabled={testMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {testMutation.isPending && (
              <Icons.spinner className="size-4 animate-spin" />
            )}
            <Icons.arrowRight className="size-4" />
            Send Request ({requestCount})
          </Button>

          <Button
            onClick={resetTest}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Icons.refresh className="size-4" />
            Reset Test
          </Button>
        </div>

        {/* Request Counter */}
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Icons.barChart className="size-4" />
          <span>Requests sent: {requestCount}</span>
          <span className="text-muted-foreground">•</span>
          <span>Limit: {maxRequests}/min</span>
        </div>

        {/* Request Logs */}
        {requestLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Icons.code className="size-4" />
              Request Log
            </h4>
            <div className="bg-muted max-h-48 overflow-y-auto rounded-lg p-3 font-mono text-sm">
              {requestLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center gap-2 py-1 ${getStatusColor(log.success)}`}
                >
                  <span className="text-muted-foreground">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  {getStatusIcon(log.success)}
                  <span className="text-muted-foreground">|</span>
                  <span>
                    {log.success
                      ? `Success - ${log.remaining} remaining`
                      : `Failed - ${log.error}`}
                  </span>
                  {log.retryAfter && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-orange-500">
                        Retry after {log.retryAfter}s
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
          <h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
            <Icons.helpCircle className="mr-1 inline size-4" />
            How to Test
          </h4>
          <ol className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>1. Click "Send Request" rapidly to test rate limiting</li>
            <li>2. Watch the request log for success/failure responses</li>
            <li>
              3. After {maxRequests} requests, you should see rate limit errors
            </li>
            <li>4. Wait 60 seconds for the rate limit to reset</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
