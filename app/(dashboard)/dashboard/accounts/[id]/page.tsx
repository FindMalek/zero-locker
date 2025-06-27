import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { DashboardAccountDetailSkeleton } from "@/components/app/dashboard-account-detail-skeleton"
import { AccountDetailView } from "@/components/app/dashboard-account-detail-view"

interface AccountDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getAccountData(id: string) {
  try {
    const context = await createContext()
    const serverClient = createServerClient(context)

    const [credential, platforms] = await Promise.all([
      serverClient.credentials.get({ id }),
      serverClient.platforms.list({
        page: 1,
        limit: 100,
      }),
    ])

    return {
      credential,
      platforms,
    }
  } catch {
    return null
  }
}

export default async function AccountDetailPage({
  params,
}: AccountDetailPageProps) {
  const resolvedParams = await params

  if (!resolvedParams.id) {
    notFound()
  }

  const data = await getAccountData(resolvedParams.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardAccountDetailSkeleton />}>
        <AccountDetailView
          initialData={data}
          credentialId={resolvedParams.id}
        />
      </Suspense>
    </div>
  )
}
