import { StatCard } from "@/components/shared/stat-card"

interface MarketingStatsProps {
  userCount: number
  encryptedDataCount: number
}

export function MarketingStats({
  userCount,
  encryptedDataCount,
}: MarketingStatsProps) {
  return (
    <section className="w-full px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <StatCard
            value={userCount?.toString() || "0"}
            label="TRUSTED BY USERS"
          />
          <StatCard
            value={encryptedDataCount?.toString() || "0"}
            label="SECRETS PROTECTED"
          />
          <div className="xs:col-span-2 lg:col-span-1">
            <StatCard value="100%" label="OPEN SOURCE" />
          </div>
        </div>
      </div>
    </section>
  )
}
