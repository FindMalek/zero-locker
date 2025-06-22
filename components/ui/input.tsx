"use client"

import * as React from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "password"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)
    
    const toggleVisibility = () => setIsVisible((prev) => !prev)

    const handleCopy = async () => {
      if (props.value) {
        await navigator.clipboard.writeText(props.value.toString())
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      }
    }

    if (variant === "password") {
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
              className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 h-8 w-8 p-0 outline-offset-2 transition-colors focus:z-10 focus-visible:outline disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
            >
              {isVisible ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </Button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isVisible ? "opacity-100 translate-x-0 w-8" : "opacity-0 translate-x-2 w-0"
              }`}
            >
              {isVisible && (
                <Button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 h-8 w-8 p-0 outline-offset-2 transition-colors focus:z-10 focus-visible:outline disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy password"
                >
                  {isCopied ? (
                    <Check size={16} strokeWidth={2} className="text-green-600" aria-hidden="true" />
                  ) : (
                    <Copy size={16} strokeWidth={2} aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
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
