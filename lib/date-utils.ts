import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  isToday,
  isYesterday,
} from "date-fns"

// Centralized date formatting utility
export class DateFormatter {
  /**
   * Format date as "MMM dd, yyyy" (e.g., "Jan 15, 2024")
   * This is the most commonly used format in the application
   */
  static formatShortDate(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  /**
   * Format date as "MMMM dd, yyyy" (e.g., "January 15, 2024")
   * Used for more formal date displays
   */
  static formatLongDate(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(dateObj)
  }

  /**
   * Format date and time as "MMMM dd, yyyy 'at' h:mm a" (e.g., "January 15, 2024 at 2:30 PM")
   * Used for detailed timestamp displays
   */
  static formatDateTime(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj)
  }

  /**
   * Format date and time with seconds as "MMMM dd, yyyy 'at' h:mm:ss a" (e.g., "January 15, 2024 at 2:30:45 PM")
   * Used for precise timestamp displays
   */
  static formatFullDateTime(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(dateObj)
  }

  /**
   * Format date as "MM/dd/yyyy" (e.g., "01/15/2024")
   * Used for compact date displays
   */
  static formatCompactDate(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj)
  }

  /**
   * Format date as "yyyy-MM-dd" (e.g., "2024-01-15")
   * Used for ISO-style date displays
   */
  static formatISODate(date: Date | string | null): string {
    if (!date) return "Never"
    
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj).replace(/\//g, "-")
  }
}

// Legacy function for backward compatibility - now uses centralized formatter
export function formatDate(date: Date | null): string {
  return DateFormatter.formatShortDate(date)
}

export function getRelativeTime(date: Date | null): string {
  if (!date) return "Never"

  const now = new Date()

  // Use date-fns timezone-aware functions for today/yesterday detection
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"

  // Use date-fns precise difference calculations
  const days = differenceInDays(now, date)
  const weeks = differenceInWeeks(now, date)
  const months = differenceInMonths(now, date)
  const years = differenceInYears(now, date)

  // Return appropriate time unit based on the largest meaningful difference
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

export function getPrimaryDate(lastViewed: Date | null, createdAt: Date) {
  if (lastViewed) {
    return {
      relative: getRelativeTime(lastViewed),
      absolute: formatDate(lastViewed),
      label: "Last viewed",
    }
  }
  return {
    relative: getRelativeTime(createdAt),
    absolute: formatDate(createdAt),
    label: "Created",
  }
}

export function getFullFormattedDateAndTime(date: Date | null): string {
  return DateFormatter.formatFullDateTime(date)
}
