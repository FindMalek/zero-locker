/**
 * Currency formatting utilities
 * Centralized location for all currency-related formatting functions
 */

/**
 * Format a number as currency using Intl.NumberFormat
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., "USD", "EUR")
 * @param locale - The locale to use for formatting (default: "en-US")
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

