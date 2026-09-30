import type { PublicContext } from "@/orpc/types"
import { ORPCError } from "@orpc/server"
import type { MiddlewareNextFn } from "@orpc/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { clearAllRateLimits, RATE_LIMIT_PRESETS } from "@/lib/utils/rate-limit"

import { strictRateLimit } from "./rate-limit"

const context: PublicContext = { session: null, user: null, ip: "203.0.113.7" }

const next = vi.fn(async () => ({
  output: undefined,
  context: {},
})) as unknown as MiddlewareNextFn<unknown>

function callStrict() {
  return strictRateLimit()({ context, next })
}

describe("strictRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    clearAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("rejects the 6th request in a window and resets in the next one", async () => {
    const { maxRequests, windowSeconds } = RATE_LIMIT_PRESETS.STRICT

    for (let i = 0; i < maxRequests; i++) {
      await expect(callStrict()).resolves.toBeDefined()
    }

    const error = await callStrict().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ORPCError)
    expect(error).toMatchObject({
      code: "TOO_MANY_REQUESTS",
      data: { retryAfter: windowSeconds, limit: maxRequests },
    })

    vi.advanceTimersByTime(windowSeconds * 1000)

    await expect(callStrict()).resolves.toBeDefined()
  })
})
