"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { allArticles } from "@/content-collections"

import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"

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
          <div key={`${article.title}-${index}`} className="flex gap-4">
            <div className="flex-shrink-0 pt-1.5">
              <div className="bg-primary size-2 rounded-full" />
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <h2 className="mb-1 text-lg font-medium">{article.title}</h2>
                <p className="text-muted-foreground mb-2 text-sm">
                  {article.description}
                </p>
                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Link
                href={article.href}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Read Article
                <Icons.arrowRight className="ml-1 size-3" />
              </Link>
            </div>
          </div>
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
