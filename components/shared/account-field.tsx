"use client"

import { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AccountFieldProps {
  label: string
  value: ReactNode
  action?: ReactNode
  separator?: boolean
  className?: string
}

export function AccountField({
  label,
  value,
  action,
  separator = true,
  className,
}: AccountFieldProps) {
  return (
    <>
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <div className="text-sm text-muted-foreground">{value}</div>
        </div>
        {action && (
          <div className="flex-shrink-0 sm:ml-4">{action}</div>
        )}
      </div>
      {separator && <Separator />}
    </>
  )
}

