"use client"

import { useEffect } from "react"

/**
 * Hook that aggressively blocks form submission events to prevent browser save dialogs
 */
export function useAggressiveFormBlocker() {
  useEffect(() => {
    const blockFormSubmission = (e: Event) => {
      const target = e.target as HTMLElement

      // Only block vault forms
      if (
        target &&
        ((target.hasAttribute?.("data-testid") &&
          target.getAttribute("data-testid")?.includes("vault-form")) ||
          target.closest?.('[data-testid*="vault-form"]') ||
          target.closest?.("[data-form-isolated]"))
      ) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    const blockEnterKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLElement

        // Block enter key on vault form inputs
        if (
          target &&
          ((target.hasAttribute?.("data-form-type") &&
            target.getAttribute("data-form-type") === "other") ||
            (target.hasAttribute?.("data-form-type") &&
              target.getAttribute("data-form-type") === "isolated") ||
            target.closest?.('[data-testid*="vault-form"]') ||
            target.closest?.("[data-form-isolated]"))
        ) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
      }
    }

    // Add multiple event listeners to catch all possible submission events
    document.addEventListener("submit", blockFormSubmission, true)
    document.addEventListener("beforesubmit", blockFormSubmission, true)
    document.addEventListener("keydown", blockEnterKey, true)
    document.addEventListener("keypress", blockEnterKey, true)

    // Also block on form elements specifically
    const forms = document.querySelectorAll('form[data-testid*="vault-form"]')
    forms.forEach((form) => {
      form.addEventListener("submit", blockFormSubmission, true)
      form.addEventListener("beforesubmit", blockFormSubmission, true)
    })

    return () => {
      document.removeEventListener("submit", blockFormSubmission, true)
      document.removeEventListener("beforesubmit", blockFormSubmission, true)
      document.removeEventListener("keydown", blockEnterKey, true)
      document.removeEventListener("keypress", blockEnterKey, true)

      forms.forEach((form) => {
        form.removeEventListener("submit", blockFormSubmission, true)
        form.removeEventListener("beforesubmit", blockFormSubmission, true)
      })
    }
  }, [])
}
