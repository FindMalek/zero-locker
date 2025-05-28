import { CardEntity } from "@/entities/card/entity"
import { CardStatusEnum, CardStatusInfer } from "@/schemas/card"

import { cn } from "@/lib/utils"

interface CardStatusIndicatorProps {
  status: CardStatusInfer
  showText?: boolean
  className?: string
}

export function CardStatusIndicator({
  status,
  showText = true,
  className,
}: CardStatusIndicatorProps) {
  const getStatusColor = (status: CardStatusInfer): string => {
    switch (status) {
      case CardStatusEnum.ACTIVE:
        return "bg-green-500"
      case CardStatusEnum.INACTIVE:
        return "bg-gray-500"
      case CardStatusEnum.EXPIRED:
        return "bg-orange-500"
      case CardStatusEnum.BLOCKED:
        return "bg-red-500"
      case CardStatusEnum.LOST:
        return "bg-red-600"
      default:
        return "bg-gray-400"
    }
  }

  const statusText = CardEntity.convertCardStatusToString(status)
  const statusColor = getStatusColor(status)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2 w-2 rounded-full", statusColor)} />
      {showText && <span>{statusText}</span>}
    </div>
  )
}
