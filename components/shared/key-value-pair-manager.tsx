"use client"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Generic key-value pair interface
export interface BaseKeyValuePair {
  id?: string
  key: string
  value: string
  [key: string]: any // Allow additional properties
}

interface KeyValuePairManagerProps<T extends BaseKeyValuePair> {
  // Required
  value: T[]
  onChange: (value: T[]) => void
  
  // Configuration
  mode?: "single" | "edit-view"
  isEditing?: boolean
  
  // Content
  label?: string
  description?: string
  placeholder?: {
    key?: string
    value?: string
  }
  
  // Behavior
  validateDuplicateKeys?: boolean
  disabled?: boolean
  className?: string
  
  // Callbacks
  onEnterEditMode?: () => void
}

export function KeyValuePairManager<T extends BaseKeyValuePair>({
  value,
  onChange,
  mode = "single",
  isEditing = true,
  label = "Key-Value Pairs",
  description = "Manage key-value pair data",
  placeholder = { key: "Enter key", value: "Enter value" },
  validateDuplicateKeys = true,
  disabled = false,
  className,
  onEnterEditMode,
}: KeyValuePairManagerProps<T>) {
  const { toast } = useToast()
  const [localPairs, setLocalPairs] = useState<T[]>(() => {
    if (value.length === 0) {
      return [{ id: `temp_empty`, key: "", value: "" } as T]
    }
    return value.map((pair) => ({ ...pair }))
  })

  // Sync with external value changes
  useEffect(() => {
    if (value.length === 0) {
      setLocalPairs([{ id: `temp_empty`, key: "", value: "" } as T])
    } else {
      setLocalPairs(value.map((pair) => ({ ...pair })))
    }
  }, [value])

  const validateKey = useCallback((key: string, currentIndex: number) => {
    if (!validateDuplicateKeys) return true
    
    const trimmedKey = key.trim()
    if (!trimmedKey) return true
    
    const isDuplicate = localPairs.some(
      (pair, i) =>
        i !== currentIndex &&
        pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
    )

    if (isDuplicate) {
      toast(
        "A key with this name already exists. Please use a unique key name.",
        "error"
      )
      return false
    }
    return true
  }, [localPairs, validateDuplicateKeys, toast])

  const handleAddPair = useCallback(() => {
    const newPair = {
      id: `temp_${Date.now()}_${Math.random()}`,
      key: "",
      value: "",
    } as T
    const updated = [...localPairs, newPair]
    setLocalPairs(updated)
    onChange(updated)
  }, [localPairs, onChange])

  const handleRemovePair = useCallback((index: number) => {
    const updated = localPairs.filter((_, i) => i !== index)
    setLocalPairs(updated)
    onChange(updated)
  }, [localPairs, onChange])

  const handleKeyChange = useCallback((index: number, newKey: string) => {
    const updated = localPairs.map((pair, i) =>
      i === index ? { ...pair, key: newKey } : pair
    )
    setLocalPairs(updated)
    onChange(updated)
  }, [localPairs, onChange])

  const handleValueChange = useCallback((index: number, newValue: string) => {
    const updated = localPairs.map((pair, i) =>
      i === index ? { ...pair, value: newValue } : pair
    )
    setLocalPairs(updated)
    onChange(updated)
  }, [localPairs, onChange])

  const handleKeyBlur = useCallback((index: number) => {
    const pair = localPairs[index]
    if (!validateKey(pair.key, index)) {
      // Reset key on validation failure
      handleKeyChange(index, "")
    }
  }, [localPairs, validateKey, handleKeyChange])

  // Determine current mode state
  const shouldShowEditMode = mode === "single" || (mode === "edit-view" && isEditing)

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
        {mode === "edit-view" && !isEditing && localPairs.some(p => p.key || p.value) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEnterEditMode}
            className="ml-auto"
          >
            <Icons.pencil className="mr-1 size-3" />
            Edit
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-lg border">
        <div className="space-y-0">
          {localPairs.map((pair, index) => (
              <div
                key={pair.id || index}
                className={cn(
                  "flex items-start gap-2 p-3 sm:gap-3 sm:p-4",
                  index > 0 && "border-border border-t"
                )}
              >
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Key
                      </Label>
                    )}
                    <Input
                      placeholder={placeholder.key}
                      value={pair.key}
                      onChange={(e) => handleKeyChange(index, e.target.value)}
                      onBlur={() => handleKeyBlur(index)}
                      readOnly={!shouldShowEditMode}
                      disabled={disabled}
                      className="font-mono text-xs"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Value
                      </Label>
                    )}
                    <Input
                      variant={shouldShowEditMode ? "password" : "default"}
                      placeholder={placeholder.value}
                      value={pair.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      readOnly={!shouldShowEditMode}
                      disabled={disabled}
                      className="font-mono text-xs"
                      autoComplete={shouldShowEditMode ? "new-password" : "off"}
                    />
                  </div>
                </div>
                
                {shouldShowEditMode && localPairs.length > 1 && (
                  <div className={cn("flex", index === 0 ? "pt-6" : "pt-0")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePair(index)}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive flex flex-shrink-0 items-center justify-center"
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {shouldShowEditMode && (
              <div className="border-border border-t p-3 sm:p-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPair}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
                >
                  <Icons.add className="size-4" />
                  Add Another
                </Button>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
