"use client"

import { useEffect } from "react"

/**
 * Hook that applies basic anti-autofill attributes to vault forms
 */
export function usePreventAutoSave(formId?: string) {
  useEffect(() => {
    const applyAntiAutofill = () => {
      const forms = formId
        ? [document.getElementById(formId)]
        : Array.from(
            document.querySelectorAll('form[data-testid*="vault-form"]')
          )

      forms.forEach((form) => {
        if (form) {
          // Basic anti-autofill attributes
          form.setAttribute("autocomplete", "off")
          form.setAttribute("data-form-type", "vault")

          // Apply password manager ignore attributes to inputs
          const inputs = form.querySelectorAll('input[type="password"]')
          inputs.forEach((input) => {
            input.setAttribute("data-lpignore", "true") // LastPass
            input.setAttribute("data-1p-ignore", "true") // 1Password
            input.setAttribute("data-bwignore", "true") // Bitwarden
            input.setAttribute("autocomplete", "new-password")
          })
        }
      })
    }

    // Apply immediately and on DOM changes
    applyAntiAutofill()
    const observer = new MutationObserver(applyAntiAutofill)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [formId])
}
