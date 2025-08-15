import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isToday,
  isYesterday,
} from "date-fns"

export function formatDate(date: Date | null): string {
  if (!date) return "Never"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
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
  if (!date) return "Never"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}
