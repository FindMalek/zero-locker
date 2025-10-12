/**
 * Utility functions for handling the display of sensitive encrypted data
 */

interface GetSensitiveValueDisplayOptions {
  /**
   * The current value being edited (if any)
   */
  currentValue?: string

  /**
   * The fetched/decrypted value from the server
   */
  fetchedValue?: string

  /**
   * Whether the value should be fetched (has the user requested to view it?)
   */
  shouldFetch: boolean

  /**
   * Whether this is an existing encrypted value (has an ID)
   */
  hasEncryptedValue: boolean

  /**
   * The placeholder dots to show for encrypted values
   * @default "••••••••"
   */
  placeholder?: string
}

/**
 * Determines what value to display for a sensitive encrypted field
 *
 * @param options - Configuration options for displaying the sensitive value
 * @returns The appropriate display value (edited value, fetched value, dots, or empty)
 *
 * @example
 * ```tsx
 * const displayValue = getSensitiveValueDisplay({
 *   currentValue: currentPassword,
 *   fetchedValue: passwordData?.password,
 *   shouldFetch: shouldFetchPassword,
 *   hasEncryptedValue: Boolean(credential?.id),
 * })
 * ```
 */
export function getSensitiveValueDisplay(
  options: GetSensitiveValueDisplayOptions
): string {
  const {
    currentValue,
    fetchedValue,
    shouldFetch,
    hasEncryptedValue,
    placeholder = "••••••••",
  } = options

  // If user is editing, show current value
  if (currentValue) {
    return currentValue
  }

  // If value has been fetched, show it
  if (fetchedValue) {
    return fetchedValue
  }

  // If encrypted value exists and hasn't been fetched yet, show placeholder dots
  if (hasEncryptedValue && !shouldFetch) {
    return placeholder
  }

  // Default to empty string for new entries
  return ""
}
