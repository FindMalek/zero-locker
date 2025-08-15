"use client"

import React, { useEffect, useRef } from "react"
import { Input, type InputProps } from "@/components/ui/input"

interface IsolatedPasswordInputProps extends Omit<InputProps, 'type'> {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Password input that's completely isolated from forms to prevent browser detection
 */
export function IsolatedPasswordInput({ 
  value = "", 
  onChange, 
  ...props 
}: IsolatedPasswordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current
      
      // Remove from form context by setting form property to null
      Object.defineProperty(input, 'form', { value: null, writable: true })
      
      // Anti-autofill attributes
      input.setAttribute('autocomplete', 'new-password')
      input.setAttribute('data-lpignore', 'true')
      input.setAttribute('data-1p-ignore', 'true') 
      input.setAttribute('data-bwignore', 'true')
      input.setAttribute('data-form-type', 'isolated')
      
      // Random name and id
      const randomId = `isolated-${Math.random().toString(36).substring(7)}`
      input.setAttribute('name', randomId)
      input.setAttribute('id', randomId)
      
      // Delay making it writable
      input.setAttribute('readonly', 'true')
      setTimeout(() => {
        input.removeAttribute('readonly')
      }, 150)
    }
  }, [])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.removeAttribute('readonly')
    props.onFocus?.(e)
  }

  return (
    <div data-form-isolated="true">
      <Input
        ref={inputRef}
        type="password"
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        data-form-type="isolated"
        readOnly
        onFocus={handleFocus}
        {...props}
      />
    </div>
  )
}
