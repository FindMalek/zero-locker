"use client"

import { useEffect, useRef, useState } from "react"

import type { RoadmapItem } from "@/types"

import { MarketingRoadmapItem } from "@/components/app/marketing-roadmap-item"
import { Icons } from "@/components/shared/icons"

interface MarketingRoadmapListProps {
  items: RoadmapItem[]
}

export function MarketingRoadmapList({ items }: MarketingRoadmapListProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10
      setShowScrollIndicator(!isAtBottom)
    }

    // Check initial state
    handleScroll()

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="border-border bg-card/50 h-[500px] space-y-12 overflow-y-auto rounded-lg border p-6 pr-4"
      >
        {items.map((item, index) => (
          <MarketingRoadmapItem
            key={`${item.title}-${index}`}
            title={item.title}
            description={item.description}
            status={item.status}
          />
        ))}
      </div>

      {/* Bottom blur gradient */}
      <div
        className={`from-background via-background/50 pointer-events-none absolute bottom-0 left-0 right-0 h-32 rounded-b-lg bg-gradient-to-t to-transparent transition-opacity duration-500 ${
          showScrollIndicator ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bouncing scroll indicator */}
      <div
        className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-500 ${
          showScrollIndicator ? "opacity-100" : "opacity-0"
        }`}
      >
        <Icons.down className="text-muted-foreground size-4" />
      </div>
    </div>
  )
}
