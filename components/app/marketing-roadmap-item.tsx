import type { RoadmapItem } from "@/types"

import { roadmapStatusConfig } from "@/config/converter"
import { cn } from "@/lib/utils"

export function MarketingRoadmapItem({
  title,
  description,
  status,
}: RoadmapItem) {
  const statusConfig = roadmapStatusConfig[status]

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 pt-1.5">
        <div className={cn("size-2 rounded-full", statusConfig.bgColor)} />
      </div>
      <div className="flex-1">
        <h2 className="mb-1 text-lg font-medium">{title}</h2>
        <p className="text-muted-foreground mb-2 text-sm">{description}</p>
        <p className={cn("text-xs", statusConfig.textColor)}>
          {statusConfig.label}
        </p>
      </div>
    </div>
  )
}
