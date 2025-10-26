"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { allArticles } from "@/content-collections"

import { DateFormatter } from "@/lib/date-utils"

import { Icons } from "@/components/shared/icons"

export function MarketingArticlesList() {
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
        className="border-border bg-card/50 h-[500px] space-y-8 overflow-y-auto rounded-lg border p-6 pr-4"
      >
        {allArticles.map((article, index) => (
          <Link
            key={`${article.title}-${index}`}
            href={article.href}
            className="hover:bg-muted/50 group flex gap-4 rounded-lg p-4 transition-all"
          >
            <div className="flex-shrink-0 pt-1.5">
              <div className="bg-primary size-2 rounded-full" />
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <h2 className="group-hover:text-primary mb-1 text-lg font-medium transition-colors">
                  {article.title}
                </h2>
                <p className="text-muted-foreground mb-2 text-sm">
                  {article.description}
                </p>
                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                  <span>
                    {DateFormatter.formatShortDate(article.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 pt-1.5">
              <Icons.arrowRight className="text-muted-foreground size-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </div>
          </Link>
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
