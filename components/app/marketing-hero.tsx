import Link from "next/link"
import { type Variants } from "motion/react"

import { MarketingWaitlistForm } from "@/components/app/marketing-waitlist-form"
import { Icons } from "@/components/shared/icons"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { Badge } from "@/components/ui/badge"
import { TextLoop } from "@/components/ui/text-loop"

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export function MarketingHero() {
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-4 py-16 sm:py-20 md:py-32 lg:gap-12">
      <AnimatedGroup variants={transitionVariants} className="w-full max-w-6xl">
        <div className="flex flex-col gap-8 px-2 sm:px-4 md:px-6 lg:gap-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:gap-6">
            <Link href="/roadmap">
              <Badge
                variant="info"
                className="hover:bg-primary/10 dark:hover:bg-primary/90 cursor-pointer px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm"
              >
                🚀 Almost MVP - Coming Soon
                <Icons.arrowRight className="ml-1 size-3" />
              </Badge>
            </Link>

            <h1 className="xs:text-3xl inline-flex flex-col items-center justify-center gap-1.5 text-4xl font-bold leading-tight sm:flex-row sm:items-baseline sm:gap-2.5 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="text-center sm:text-left">The open source</span>
              <TextLoop
                transition={{
                  type: "spring",
                  stiffness: 900,
                  damping: 95,
                  mass: 5,
                }}
                variants={{
                  initial: {
                    y: 5,
                    rotateX: 90,
                    opacity: 0,
                    filter: "blur(10px)",
                  },
                  animate: {
                    y: 0,
                    rotateX: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                  },
                  exit: {
                    y: -5,
                    rotateX: -90,
                    opacity: 0,
                    filter: "blur(10px)",
                  },
                }}
              >
                {[
                  <Icons.lastPass
                    key="lastPass"
                    className="xs:size-10 size-12 opacity-80 sm:size-12 md:size-16 lg:size-20"
                  />,
                  <Icons.hashicorp
                    key="hashicorp"
                    className="xs:size-10 size-12 opacity-80 sm:size-12 md:size-16 lg:size-20 dark:invert"
                  />,
                  <Icons.onePassword
                    key="onePassword"
                    className="xs:size-10 size-12 opacity-80 sm:size-12 md:size-16 lg:size-20"
                  />,
                  <Icons.dashlane
                    key="dashlane"
                    className="xs:size-10 size-12 opacity-80 sm:size-12 md:size-16 lg:size-20"
                  />,
                ]}
              </TextLoop>
              <span className="text-center sm:text-left">alternative</span>
            </h1>

            <p className="text-muted-foreground xs:max-w-sm xs:text-lg max-w-xs text-base leading-relaxed sm:max-w-xl md:max-w-2xl md:text-xl">
              Enterprise-grade security meets intuitive design. Self-hostable,
              built for developers and security-conscious users who demand both
              simplicity and powerful encryption.
            </p>

            <div className="w-full max-w-md sm:max-w-lg">
              <MarketingWaitlistForm />
            </div>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  )
}
