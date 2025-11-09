"use client"

import * as React from "react"
import { Eye, EyeOff, Copy, Check, RefreshCw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { generatePassword } from "@/lib/utils/password-helpers"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
variant?: "default" | "password" | "password-copyable" | "password-full" | "editable"
onEyeClick?: () => void
onGenerate?: (password: string) => void
showGenerateButton?: boolean
isLoading?: boolean
onSave?: () => void
onCancel?: () => void
isSaving?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", onEyeClick, onGenerate, showGenerateButton = false, isLoading = false, onSave, onCancel, isSaving = false, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const { isCopied, copy } = useCopyToClipboard()
    
    const toggleVisibility = () => {
      setIsVisible((prev) => !prev)
      onEyeClick?.()
    }

    const handleCopy = async () => {
      if (props.value) {
        await copy(props.value.toString())
      }
    }

    const handleGenerate = () => {
      const password = generatePassword(16)
      if (onGenerate) {
        onGenerate(password)
      }
      setIsVisible(true)
    }

    if (variant === "password") {
      return (
        <div className="relative w-full">
          <input
            type={isVisible ? "text" : "password"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pe-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <Button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              variant="ghost"
              size="icon"
            >
              {isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      )
    }

    if (variant === "password-copyable") {
      return (
        <div className="relative w-full">
          <input
            type={isVisible ? "text" : "password"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pe-20 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
            <Button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              variant="ghost"
              size="icon"
            >
              {isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isVisible ? "opacity-100 translate-x-0 w-8" : "opacity-0 translate-x-2 w-0"
              }`}
            >
              {isVisible && (
                <Button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy password"
                  variant="ghost"
                >
                  {isCopied ? (
                    <Check className="size-3 text-success" ria-hidden="true" />
                  ) : (
                    <Copy className="size-3" ria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (variant === "password-full") {
      const buttonCount = [true, true, showGenerateButton].filter(Boolean).length // eye, copy, generate
      const paddingRight = buttonCount * 32 + 8 // 32px per button + 8px base padding
      
      return (
        <div className="relative w-full">
          <input
            type={isVisible ? "text" : "password"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            style={{ paddingRight: `${paddingRight}px` }}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
            {showGenerateButton && (
              <Button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate secure password"
                variant="ghost"
                size="icon"
                className="size-8"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
              </Button>
            )}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isVisible ? "opacity-100 translate-x-0 w-8" : "opacity-0 translate-x-2 w-0"
              }`}
            >
              {isVisible && (
                <Button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy password"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  {isCopied ? (
                    <Check className="size-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
            <Button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="border-muted-foreground size-4 animate-spin rounded-full border border-t-transparent" />
              ) : isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      )
    }

    if (variant === "editable") {
      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          onSave?.()
        } else if (e.key === "Escape") {
          e.preventDefault()
          onCancel?.()
        }
        props.onKeyDown?.(e)
      }

      return (
        <div className="relative w-full">
          <input
            type={type}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pe-20 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            disabled={props.disabled || isSaving}
            onKeyDown={handleKeyDown}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
            <Button
              type="button"
              onClick={onSave}
              disabled={props.disabled || isSaving}
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Save"
            >
              {isSaving ? (
                <div className="border-muted-foreground size-4 animate-spin rounded-full border border-t-transparent" />
              ) : (
                <Check className="size-4 text-success" aria-hidden="true" />
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={props.disabled || isSaving}
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Cancel"
            >
              <X className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
