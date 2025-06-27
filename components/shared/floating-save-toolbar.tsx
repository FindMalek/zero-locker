"use client"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

interface FloatingSaveToolbarProps {
  isVisible: boolean
  onSave: () => void
  onDiscard: () => void
  className?: string
}

export function FloatingSaveToolbar({
  isVisible,
  onSave,
  onDiscard,
  className,
}: FloatingSaveToolbarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 transform transition-all duration-300 ease-in-out",
        isVisible
          ? "translate-x-[-50%] translate-y-0 opacity-100"
          : "pointer-events-none translate-x-[-50%] translate-y-4 opacity-0",
        className
      )}
    >
      <div className="bg-background border-border flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg">
        <span className="text-sm font-medium">Unsaved changes</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" onClick={onSave}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
