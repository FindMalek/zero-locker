"use client"

import { ReactNode } from "react"

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
          <p className="text-foreground text-sm font-medium">{label}</p>
          <div className="text-muted-foreground text-sm">{value}</div>
        </div>
        {action && <div className="flex-shrink-0 sm:ml-4">{action}</div>}
      </div>
      {separator && <Separator />}
    </>
  )
}
