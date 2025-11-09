import { CardSimpleOutput } from "@/schemas/card"
import { CredentialSimpleOutput } from "@/schemas/credential/output"
import { SecretSimpleOutput } from "@/schemas/secrets"
import {
  ActivityType,
  ActivityTypeEnum,
  EntityType,
  EntityTypeEnum,
  RawEntity,
  RecentItemBase,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"
import { ContainerType } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError, ZodIssue } from "zod"

import { env } from "@/env"
import { KeyValuePair, User as UserType } from "@/types"

import { PRIORITY_ACTIVITY_TYPE } from "@/config/consts"

import { DateFormatter, getRelativeTime } from "../date-utils"

export * from "./card-expiry-helpers"
export * from "./color-helpers"
export * from "./currency-utils"
export * from "./password-helpers"
export * from "./sensitive-data-helpers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarOrFallback(user: UserType) {
  if (!user.image) {
    return `https://avatar.vercel.sh/${user.name}`
  }

  return user.image
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function sortByPriority(
  activities: { date: Date; type: ActivityType }[]
) {
  return [...activities].sort((a, b) => {
    const priorityA = PRIORITY_ACTIVITY_TYPE[a.type] ?? 99
    const priorityB = PRIORITY_ACTIVITY_TYPE[b.type] ?? 99
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    return b.date.getTime() - a.date.getTime()
  })
}

export function getItemName(entity: RawEntity, type: RecentItemType): string {
  switch (type) {
    case RecentItemTypeEnum.CREDENTIAL:
      return (entity as CredentialSimpleOutput).identifier
    case RecentItemTypeEnum.CARD:
      return (entity as CardSimpleOutput).name
    case RecentItemTypeEnum.SECRET:
      return (entity as SecretSimpleOutput).name
  }
}

export function mapItem(
  rawItem: RawEntity,
  itemType: RecentItemType
): RecentItemBase {
  const createdAtDate = new Date(rawItem.createdAt)
  const updatedAtDate = new Date(rawItem.updatedAt)

  const potentialActivities: {
    date: Date
    type: ActivityType
  }[] = [
    { date: createdAtDate, type: ActivityTypeEnum.CREATED },
    { date: updatedAtDate, type: ActivityTypeEnum.UPDATED },
  ]

  const sortedActivities = sortByPriority(potentialActivities)

  const lastActivity = sortedActivities[0] || {
    date: updatedAtDate,
    type: ActivityTypeEnum.UPDATED,
  }

  return {
    id: rawItem.id,
    createdAt: createdAtDate,
    updatedAt: updatedAtDate,
    name: getItemName(rawItem, itemType),
    lastActivityAt: lastActivity.date,
    activityType: lastActivity.type,
  }
}

/**
 * Check if a pathname is active for a given link href.
 * Handles both exact matches and nested routes.
 *
 * @param currentPathname - The current pathname (e.g., "/account/invoices/123")
 * @param linkHref - The link href to check against (e.g., "/account/invoices")
 * @returns true if the pathname matches the href exactly or is a nested route
 *
 * @example
 * ```ts
 * checkIsActive("/account/invoices/123", "/account/invoices") // true (nested)
 * checkIsActive("/account/invoices", "/account/invoices") // true (exact)
 * checkIsActive("/account/invoices", "/account") // false (parent route)
 * checkIsActive("/account", "/account") // true (exact)
 * ```
 */
export function checkIsActive(
  currentPathname: string,
  linkHref: string
): boolean {
  // Exact match
  if (currentPathname === linkHref) {
    return true
  }

  // Check if pathname is a nested route (starts with href + "/")
  // This ensures we match nested routes like /account/invoices/[id]
  // but don't match partial matches like /account/invoices-something
  if (!currentPathname.startsWith(`${linkHref}/`)) {
    return false
  }

  // Prevent parent routes from matching sibling routes
  // For example: /account should not match /account/invoices
  // But /account/invoices should match /account/invoices/123
  const pathnameSegments = currentPathname.split("/").filter(Boolean)
  const hrefSegments = linkHref.split("/").filter(Boolean)

  // Verify that all href segments match the corresponding pathname segments
  // This ensures we're matching a true nested route, not just a similar path
  for (let i = 0; i < hrefSegments.length; i++) {
    if (pathnameSegments[i] !== hrefSegments[i]) {
      return false
    }
  }

  // If all segments match, check if it's a nested route
  // The pathname must have more segments than the href (it's deeper)
  const depthDifference = pathnameSegments.length - hrefSegments.length

  // Only match if the pathname is deeper (has more segments)
  // This allows /account/invoices to match /account/invoices/123
  // But we need to prevent /account from matching /account/invoices or /account/invoices/ID

  // Special case: if href is a single segment (like /account), don't match nested routes
  // This prevents /account from matching /account/invoices (sibling) or /account/invoices/ID (nested)
  // Single-segment routes should only match exactly
  if (hrefSegments.length === 1) {
    return false
  }

  // For multi-segment hrefs, if all segments match and pathname is deeper, it's nested
  // This allows /account/invoices to match /account/invoices/123
  return depthDifference > 0
}

/**
 * Process different types of errors and return standardized error messages
 *
 * @param error The error to process (can be any type)
 * @param defaultMessage Default message to show if error type is not recognized
 * @returns Standardized error object with message and details
 */
export function handleErrors(
  error: unknown,
  defaultMessage = "An unexpected error occurred"
): { message: string; details?: string | string[] } {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.map((issue: ZodIssue) =>
      issue.path.length > 0
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message
    )

    return {
      message: "Validation failed",
      details: details.length === 1 ? details[0] : details,
    }
  }

  // Handle API response errors that contain issues array
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    const issues = error.issues as ZodIssue[]
    const details = issues.map((issue: ZodIssue) =>
      issue.path.length > 0
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message
    )

    return {
      message: "Validation failed",
      details: details.length === 1 ? details[0] : details,
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || defaultMessage,
      details: error.stack ? error.stack.split("\n")[0] : undefined,
    }
  }

  // Handle API response errors
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return {
      message: error.error,
      details:
        "message" in error && typeof error.message === "string"
          ? error.message
          : undefined,
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
    }
  }

  // Default case for unknown error types
  return {
    message: defaultMessage,
  }
}

/**
 * Handle oRPC errors with special handling for rate limiting
 *
 * @param error The error from oRPC mutation/query
 * @param defaultMessage Default message to show if error type is not recognized
 * @returns Object with message and optional description (includes retry-after for rate limits)
 */
export function handleORPCError(
  error: unknown,
  defaultMessage = "Something went wrong. Please try again."
): {
  message: string
  description: string
  retryAfter?: number
} {
  let message = defaultMessage
  let description = "Please try again later."
  let retryAfter: number | undefined

  // Extract error message
  if (error && typeof error === "object" && "message" in error) {
    message = String(error.message)
  }

  // Handle rate limit errors specifically
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "retryAfter" in error.data
  ) {
    const parsedRetryAfter = Number(error.data.retryAfter)

    // Only use retryAfter if it's a valid finite number
    if (Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0) {
      retryAfter = parsedRetryAfter
      description = `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
    } else {
      // Use fallback description when retryAfter is invalid
      description = "Rate limit exceeded. Please try again in a few seconds."
    }
  }

  return {
    message,
    description,
    retryAfter,
  }
}

/**
 * Returns an object with the given value if it exists, otherwise returns an empty object
 * @param value The value to check
 * @param key The key to use in the returned object
 * @returns An object with the value if it exists, otherwise an empty object
 */
export function getOrReturnEmptyObject<T>(
  value: T | undefined | null,
  key: string
): Record<string, T> {
  return value ? { [key]: value } : {}
}

export function getPlaceholderImage(
  string: string,
  url: string | undefined | null
): string {
  if (url && url !== null) {
    return url
  }

  return `https://avatar.vercel.sh/${string}`
}

export function getLogoURL(brand: string, size: number = 128) {
  return `https://img.logo.dev/${brand}?token=${env.NEXT_PUBLIC_LOGO_DEV_TOKEN}&size=${size}&retina=true`
}

export function getLogoDevUrlWithToken(url: string | null) {
  if (!url) {
    return null
  }

  return `${url}?token=${env.NEXT_PUBLIC_LOGO_DEV_TOKEN}&format=png`
}

/**
 * Generate metadata labels from form values based on field mappings
 * @param values The form values object
 * @param fieldMappings Object mapping field names to their display labels
 * @param maxLabels Maximum number of labels to show before truncating with "..."
 * @returns Formatted string of labels
 */
export function getMetadataLabels(
  values: Record<string, unknown>,
  fieldMappings: Record<string, string>,
  maxLabels: number = 2
): string {
  const labels: string[] = []

  for (const [fieldName, label] of Object.entries(fieldMappings)) {
    const value = values[fieldName]

    // Check if field has a meaningful value
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (like otherInfo)
      if (Array.isArray(value) && value.length > 0) {
        labels.push(label)
      }
      // Handle booleans (like has2FA)
      else if (typeof value === "boolean" && value) {
        labels.push(label)
      }
      // Handle strings (trim whitespace)
      else if (typeof value === "string" && value.trim()) {
        labels.push(label)
      }
      // Handle other truthy values
      else if (value) {
        labels.push(label)
      }
    }
  }

  if (labels.length === 0) return ""

  const displayLabels = labels.slice(0, maxLabels)
  const hasMore = labels.length > maxLabels

  return displayLabels.join(", ") + (hasMore ? "..." : "")
}

/**
 * Validates if an entity type can be added to a container based on container type
 */
export function validateEntityForContainer(
  containerType: ContainerType,
  entityType: EntityType
): boolean {
  switch (containerType) {
    case ContainerType.MIXED:
      return true
    case ContainerType.SECRETS_ONLY:
      return entityType === EntityTypeEnum.SECRET
    case ContainerType.CREDENTIALS_ONLY:
      return entityType === EntityTypeEnum.CREDENTIAL
    case ContainerType.CARDS_ONLY:
      return entityType === EntityTypeEnum.CARD
    default:
      return false
  }
}

/**
 * Gets the allowed entity types for a container
 */
export function getAllowedEntityTypes(containerType: ContainerType): string[] {
  switch (containerType) {
    case ContainerType.MIXED:
      return [
        EntityTypeEnum.SECRET,
        EntityTypeEnum.CREDENTIAL,
        EntityTypeEnum.CARD,
      ]
    case ContainerType.SECRETS_ONLY:
      return [EntityTypeEnum.SECRET]
    case ContainerType.CREDENTIALS_ONLY:
      return [EntityTypeEnum.CREDENTIAL]
    case ContainerType.CARDS_ONLY:
      return [EntityTypeEnum.CARD]
    default:
      return []
  }
}

/**
 * Parse text into key-value pairs, supporting .env file format
 * @param text The text to parse, can be multiple lines
 * @returns Array of key-value pairs
 */
export function parseKeyValuePairs(text: string): KeyValuePair[] {
  const lines = text.split("\n")
  return lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [key, ...valueParts] = line.split("=")
      return {
        key: key.trim(),
        value: valueParts
          .join("=")
          .trim()
          .replace(/^["']|["']$/g, ""),
      }
    })
    .filter((pair) => pair.key && pair.value)
}

export function getCreatedOrLastViewedText(
  date: Date | null,
  lastViewed: boolean
) {
  if (!date)
    return `Created recently at ${DateFormatter.formatLongDate(new Date())}`

  if (!lastViewed)
    return `Created ${getRelativeTime(date).toLowerCase()} at ${DateFormatter.formatLongDate(date)}`

  return `Last seen ${getRelativeTime(date).toLowerCase()} on ${DateFormatter.formatLongDate(date)}`
}
