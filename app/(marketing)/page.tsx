import { MarketingFeatures } from "@/components/app/marketing-features"
import { MarketingHero } from "@/components/app/marketing-hero"
import { MarketingHowItWorks } from "@/components/app/marketing-how-it-works"
import { MarketingStats } from "@/components/app/marketing-stats"

export default function Home() {
  return (
    <>
      <MarketingHero />
      <MarketingStats />
      <MarketingFeatures />
      <MarketingHowItWorks />
    </>
  )
}
