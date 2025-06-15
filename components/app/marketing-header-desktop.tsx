"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"
import { HyperText } from "@/components/ui/hyper-text"

export function MarketingHeaderDesktop() {
  const isMobile = useIsMobile()
  return (
    <header className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Icons.logo />
          {!isMobile && <span className="text-xl">{siteConfig.name}</span>}
        </h1>
      </div>
      <div className="text-secondary-foreground/70 hidden items-center justify-center text-xs md:flex">
        <HyperText
          duration={500}
          delay={6}
          as="div"
          className="hidden text-xs md:block"
        >
          CURRENTLY IN PRIVATE BETA - BUILT BY
        </HyperText>{" "}
        <Link className="pl-2" href="https://www.findmalek.com">
          <HyperText
            duration={500}
            delay={4}
            as="div"
            className="text-primary ml-1 hidden text-xs md:block"
          >
            MALEK GARA-HELLAL
          </HyperText>
        </Link>
      </div>
      <div className="flex items-center">
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
