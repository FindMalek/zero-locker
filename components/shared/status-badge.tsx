"use client"

import { AccountStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: AccountStatus
  compact?: boolean
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const getStatusConfig = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return {
          label: "Active",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
        }
      case AccountStatus.SUSPENDED:
        return {
          label: "Suspended",
          className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
        }
      case AccountStatus.DELETED:
        return {
          label: "Deleted",
          className:
            "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
        }
      default:
        return {
          label: status,
          className:
            "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
        }
    }
  }

  const config = getStatusConfig(status)
  const sizeClasses = compact
    ? "text-xs font-medium h-5 px-2"
    : "text-xs font-medium h-6 px-2.5"

  return (
    <Badge variant="outline" className={`${config.className} ${sizeClasses}`}>
      {config.label}
    </Badge>
  )
}
