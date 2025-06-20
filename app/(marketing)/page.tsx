import { createServerClient } from "@/orpc/client/server"

import { MarketingFeatures } from "@/components/app/marketing-features"
import { MarketingFooter } from "@/components/app/marketing-footer"
import { MarketingHeaderDesktop } from "@/components/app/marketing-header-desktop"
import { MarketingHero } from "@/components/app/marketing-hero"
import { MarketingHowItWorks } from "@/components/app/marketing-how-it-works"
import { MarketingStats } from "@/components/app/marketing-stats"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

export default async function Home() {
  const serverClient = createServerClient({
    session: null,
    user: null,
  })

  let users = { total: 0 }
  let waitlist = { total: 0 }
  let encryptedData = { count: 0 }

  try {
    const [waitlistResult, usersResult, encryptedDataResult] =
      await Promise.all([
        serverClient.users.getWaitlistCount({}),
        serverClient.users.getUserCount({}),
        serverClient.users.getEncryptedDataCount({}),
      ])

    waitlist = waitlistResult
    users = usersResult
    encryptedData = encryptedDataResult
  } catch (error) {
    console.warn(
      "Database not available during build, using default values:",
      error
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-0 overflow-hidden bg-black/5">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={1}
          duration={3}
          className="text-primary/10"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <MarketingHeaderDesktop />
        <MarketingHero waitlistCount={waitlist.total || 0} />
        <MarketingStats
          userCount={users.total || 0}
          encryptedDataCount={encryptedData.count || 0}
        />
        <MarketingFeatures />
        <MarketingHowItWorks />
        <MarketingFooter />
      </div>
    </div>
  )
}
