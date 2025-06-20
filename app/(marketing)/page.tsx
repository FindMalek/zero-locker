import { createServerClient } from "@/orpc/client/server"

import { MarketingFooter } from "@/components/app/marketing-footer"
import { MarketingHeaderDesktop } from "@/components/app/marketing-header-desktop"
import { MarketingHeaderMobile } from "@/components/app/marketing-header-mobile"
import { MarketingWaitlistForm } from "@/components/app/marketing-waitlist-form"
import { StatCard } from "@/components/shared/stat-card"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

export default async function Home() {
  const serverClient = createServerClient({
    session: null,
    user: null,
  })

  let waitlist = { total: 0 }
  let users = { total: 0 }
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
    // Silently handle database connection errors during build
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
        <MarketingHeaderMobile />
        <MarketingHeaderDesktop />

        <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col items-stretch gap-8 space-x-6 lg:flex-row lg:gap-16">
              <div className="flex lg:w-1/2">
                <MarketingWaitlistForm count={waitlist.total || 0} />
              </div>

              <div className="flex lg:w-1/2">
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                  <StatCard
                    value={users.total?.toString() || "0"}
                    label="USERS SIGNED UP"
                  />
                  <StatCard
                    value={encryptedData.count?.toString() || "0"}
                    label="MANAGED ENCRYPTED SECRETS"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <MarketingFooter />
      </div>
    </div>
  )
}
