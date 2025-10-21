"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"

export function MarketingHeaderDesktop() {
  const isMobile = useIsMobile()
  return (
    <header className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Icons.logo />
          {!isMobile && <span className="text-xl">{siteConfig.name}</span>}
        </Link>
        {!isMobile && (
          <nav className="flex items-center gap-6">
            <Link
              href="/roadmap"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Roadmap
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Social Media Links */}
        <div className="flex items-center gap-2">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" })
            )}
            aria-label="GitHub"
          >
            <Icons.github className="size-4" />
          </Link>
          <Link
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" })
            )}
            aria-label="X (Twitter)"
          >
            <Icons.twitter className="size-4" />
          </Link>
        </div>

        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          {isMobile ? <Icons.login /> : "Login"}
        </Link>
      </div>
    </header>
  )
}
