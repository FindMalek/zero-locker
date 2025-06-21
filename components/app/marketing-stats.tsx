"use client"

import { useEncryptedDataCount, useUserCount } from "@/orpc/hooks"

import { StatCard } from "@/components/shared/stat-card"

export function MarketingStats() {
  const { data: userData, isLoading: userLoading } = useUserCount()
  const { data: encryptedData, isLoading: encryptedLoading } =
    useEncryptedDataCount()

  const userCount = userData?.total ?? 0
  const encryptedDataCount = encryptedData?.count ?? 0

  return (
    <section className="w-full px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <StatCard
            value={userLoading ? "..." : userCount.toString()}
            label="TRUSTED BY USERS"
          />
          <StatCard
            value={encryptedLoading ? "..." : encryptedDataCount.toString()}
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
