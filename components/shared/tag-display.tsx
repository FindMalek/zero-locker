"use client"

import type { TagSimpleRo } from "@/schemas/utils/tag"
import { useTheme } from "next-themes"

import { Icons } from "@/components/shared/icons"
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
    <div className="flex items-center">
      <TagBadge tag={firstTag} size={size} isConnected />

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`-ml-px rounded-l-none border-gray-200 px-2 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 ${
              size === "sm" ? "h-5" : "h-6 px-2.5 text-sm"
            }`}
          >
            +{remainingCount}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-auto p-3" align="start">
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {remainingTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size={size} />
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

interface TagBadgeProps {
  tag: TagSimpleRo
  size?: "sm" | "md"
  isConnected?: boolean
}

function TagBadge({ tag, size = "sm", isConnected = false }: TagBadgeProps) {
  const { theme, resolvedTheme } = useTheme()
  const color = tag.color

  // Determine if we're in dark mode
  const isDark =
    resolvedTheme === "dark" || (theme === "system" && resolvedTheme === "dark")

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  // Helper function to calculate luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const rs = r / 255
    const gs = g / 255
    const bs = b / 255

    const rLin =
      rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4)
    const gLin =
      gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4)
    const bLin =
      bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4)

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
  }

  // Create adaptive colors based on theme and original color
  const getAdaptiveColors = (color: string) => {
    const rgb = hexToRgb(color)

    if (!rgb) {
      // Fallback for invalid colors
      return {
        backgroundColor: isDark
          ? "rgba(64, 64, 64, 0.3)"
          : "rgba(128, 128, 128, 0.1)",
        textColor: isDark ? "#d1d5db" : "#374151",
        borderColor: isDark
          ? "rgba(156, 163, 175, 0.3)"
          : "rgba(75, 85, 99, 0.2)",
      }
    }

    const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
    const isLightColor = luminance > 0.5

    if (isDark) {
      // Dark mode: Use more saturated backgrounds and lighter text
      const backgroundOpacity = isLightColor ? 0.2 : 0.3
      const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${backgroundOpacity})`

      // For text, use the original color but ensure it's light enough
      const textColor = isLightColor
        ? color
        : `rgb(${Math.max(rgb.r + 80, 200)}, ${Math.max(rgb.g + 80, 200)}, ${Math.max(rgb.b + 80, 200)})`

      const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`

      return { backgroundColor, textColor, borderColor }
    } else {
      // Light mode: Use lighter backgrounds and darker text
      const backgroundOpacity = 0.1
      const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${backgroundOpacity})`

      // For text, darken the color if it's too light
      const textColor = isLightColor
        ? `rgb(${Math.max(rgb.r - 100, 0)}, ${Math.max(rgb.g - 100, 0)}, ${Math.max(rgb.b - 100, 0)})`
        : color

      const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`

      return { backgroundColor, textColor, borderColor }
    }
  }

  const { backgroundColor, textColor, borderColor } = getAdaptiveColors(color)

  return (
    <Badge
      variant="outline"
      className={`border-0 font-medium transition-all duration-200 ${
        isConnected ? "rounded-r-none" : ""
      } ${size === "sm" ? "h-5 px-2 text-xs" : "h-6 px-2.5 text-sm"}`}
      style={{
        backgroundColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {isConnected && <Icons.tag className="size-3 pr-0.5" />}
      {tag.name}
    </Badge>
  )
}
