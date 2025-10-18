/**
 * IP-based Rate Limiting Utility
 *
 * This module provides rate limiting functionality based on IP addresses.
 * It uses an in-memory cache for development and can be easily switched to Redis for production.
 *
 * Features:
 * - Sliding window rate limiting
 * - Per-IP tracking
 * - Automatic cleanup of expired entries
 * - Configurable limits and windows
 */

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number

  /**
   * Time window in seconds
   */
  windowSeconds: number

  /**
   * Optional identifier for the rate limit (e.g., "api", "auth", "public")
   */
  identifier?: string
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean

  /**
   * Number of requests remaining in the current window
   */
  remaining: number

  /**
   * Total limit for the window
   */
  limit: number

  /**
   * Timestamp when the rate limit will reset (in seconds)
   */
  resetAt: number

  /**
   * Number of seconds to wait before retrying
   */
  retryAfter?: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Public interface for rate limit store operations
 * Exposes only safe, non-breaking methods for external use
 */
export interface RateLimitStore {
  clear(): void
  size(): number
  destroy(): void
}

/**
 * Public interface for rate limit statistics
 * Safe to expose in declaration files
 */
export interface RateLimitStats {
  count: number
  resetAt: number
}

/**
 * In-memory cache for rate limiting
 * In production, replace this with Redis or another distributed cache
 */
class RateLimitCache {
  private cache: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Start cleanup interval to remove expired entries every minute
    this.startCleanup()
  }

  private startCleanup(): void {
    // Clear existing interval if any
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Run cleanup every 60 seconds
    const interval = setInterval(() => {
      this.cleanup()
    }, 60000)

    this.cleanupInterval = interval

    // Do not keep the event loop alive in Node.js
    // Use optional chaining with type assertion for cross-runtime compatibility
    interval?.unref?.()
  }

  private cleanup(): void {
    const now = Math.floor(Date.now() / 1000)

    for (const [key, entry] of this.cache.entries()) {
      if (entry.resetAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.cache.get(key)

    // Remove expired entries on access
    if (entry && entry.resetAt <= Math.floor(Date.now() / 1000)) {
      this.cache.delete(key)
      return undefined
    }

    return entry
  }

  set(key: string, entry: RateLimitEntry): void {
    this.cache.set(key, entry)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton cache instance
const rateLimitCache = new RateLimitCache()

/**
 * Get rate limit cache instance (useful for testing or manual cleanup)
 */
export function getRateLimitCache(): RateLimitStore {
  return rateLimitCache
}

/**
 * Generate a unique key for rate limiting
 */
function generateKey(ip: string, identifier?: string): string {
  return identifier ? `ratelimit:${identifier}:${ip}` : `ratelimit:${ip}`
}

/**
 * Check and increment rate limit for an IP address
 *
 * @param ip - The IP address to check
 * @param config - Rate limit configuration
 * @returns Rate limit result indicating if the request is allowed
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds, identifier } = config
  const key = generateKey(ip, identifier)
  const now = Math.floor(Date.now() / 1000)

  // Get existing entry or create new one
  let entry = rateLimitCache.get(key)

  if (!entry) {
    // First request from this IP
    entry = {
      count: 1,
      resetAt: now + windowSeconds,
    }
    rateLimitCache.set(key, entry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetAt: entry.resetAt,
    }
  }

  // Check if the window has expired
  if (entry.resetAt <= now) {
    // Reset the window
    entry = {
      count: 1,
      resetAt: now + windowSeconds,
    }
    rateLimitCache.set(key, entry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetAt: entry.resetAt,
    }
  }

  // Increment the count
  entry.count++
  rateLimitCache.set(key, entry)

  // Check if limit is exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      limit: maxRequests,
      resetAt: entry.resetAt,
      retryAfter: entry.resetAt - now,
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    limit: maxRequests,
    resetAt: entry.resetAt,
  }
}

/**
 * Reset rate limit for a specific IP
 * Useful for testing or manual interventions
 */
export function resetRateLimit(ip: string, identifier?: string): void {
  const key = generateKey(ip, identifier)
  rateLimitCache.delete(key)
}

/**
 * Clear all rate limit entries
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitCache.clear()
}

/**
 * Get current rate limit stats for an IP
 */
export function getRateLimitStats(
  ip: string,
  identifier?: string
): RateLimitStats | null {
  const key = generateKey(ip, identifier)
  const entry = rateLimitCache.get(key)
  return entry || null
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMIT_PRESETS = {
  // Very strict - for sensitive endpoints (e.g., password reset)
  STRICT: {
    maxRequests: 5,
    windowSeconds: 60,
  },
  // Moderate - for general public endpoints
  MODERATE: {
    maxRequests: 30,
    windowSeconds: 60,
  },
  // Lenient - for high-traffic public endpoints
  LENIENT: {
    maxRequests: 100,
    windowSeconds: 60,
  },
  // Very lenient - for static content or health checks
  VERY_LENIENT: {
    maxRequests: 300,
    windowSeconds: 60,
  },
} as const
