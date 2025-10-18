interface MarketingRoadmapItemProps {
  title: string
  description: string
  status: "done" | "in-progress" | "planned"
}

export function MarketingRoadmapItem({
  title,
  description,
  status,
}: MarketingRoadmapItemProps) {
  const statusColors = {
    done: "bg-emerald-500",
    "in-progress": "bg-blue-500",
    planned: "bg-gray-600",
  }

  const statusTextColors = {
    done: "text-emerald-500",
    "in-progress": "text-blue-500",
    planned: "text-muted-foreground",
  }

  const statusLabels = {
    done: "done",
    "in-progress": "in progress",
    planned: "not started",
  }

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 pt-1.5">
        <div className={`size-2 rounded-full ${statusColors[status]}`} />
      </div>
      <div className="flex-1">
        <h2 className="mb-1 text-lg font-medium">{title}</h2>
        <p className="text-muted-foreground mb-2 text-sm">{description}</p>
        <p className={`text-xs ${statusTextColors[status]}`}>
          {statusLabels[status]}
        </p>
      </div>
    </div>
  )
}
