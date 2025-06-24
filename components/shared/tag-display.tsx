"use client"

import type { TagSimpleRo } from "@/schemas/utils/tag"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface TagDisplayProps {
  tags: TagSimpleRo[]
  size?: "sm" | "md"
}

export function TagDisplay({ tags, size = "sm" }: TagDisplayProps) {
  if (tags.length === 0) {
    return null
  }

  // If only one tag, show it alone
  if (tags.length === 1) {
    return <TagBadge tag={tags[0]} size={size} />
  }

  // If multiple tags, show first tag + hover card with remaining count
  const firstTag = tags[0]
  const remainingTags = tags.slice(1)
  const remainingCount = remainingTags.length

  return (
    <div className="flex items-center gap-1.5">
      <TagBadge tag={firstTag} size={size} />

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-5 border-gray-200 px-2 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 ${
              size === "md" ? "h-6 px-2.5 text-sm" : ""
            }`}
          >
            +{remainingCount}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500">
              {tags.length} tags total
            </div>
            <div className="flex max-w-xs flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size={size} />
              ))}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

interface TagBadgeProps {
  tag: TagSimpleRo
  size?: "sm" | "md"
}

function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const color = tag.color

  // Create light background version
  const getLightBackground = (color: string) => {
    if (color.startsWith("#")) {
      // Convert hex to RGB and create light version
      const r = Number.parseInt(color.slice(1, 3), 16)
      const g = Number.parseInt(color.slice(3, 5), 16)
      const b = Number.parseInt(color.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, 0.1)`
    }
    return color + "50"
  }

  const backgroundColor = getLightBackground(color)

  return (
    <Badge
      variant="outline"
      className={`border-0 font-medium transition-all duration-200 ${
        size === "sm" ? "h-5 px-2 text-xs" : "h-6 px-2.5 text-sm"
      }`}
      style={{
        backgroundColor,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {tag.name}
    </Badge>
  )
}
