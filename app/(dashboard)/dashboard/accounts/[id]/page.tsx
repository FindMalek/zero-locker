import { Suspense } from "react"
import { Metadata } from "next"
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

export async function generateMetadata({
  params,
}: AccountDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params

  if (!resolvedParams.id) {
    return {
      title: "Account Not Found",
      description: "The requested account could not be found.",
    }
  }

  const data = await getAccountData(resolvedParams.id)

  if (!data) {
    return {
      title: "Account Not Found",
      description: "The requested account could not be found.",
    }
  }

  const { credential, platforms } = data
  const platform = platforms.platforms.find(
    (p) => p.id === credential.platformId
  )
  const platformName = platform?.name || "Unknown Platform"

  return {
    title: `${credential.identifier} - ${platformName}`,
    description: credential.description
      ? `Account details for ${credential.identifier} on ${platformName}. ${credential.description}`
      : `Account details for ${credential.identifier} on ${platformName}.`,
    openGraph: {
      title: `${credential.identifier} - ${platformName}`,
      description: credential.description
        ? `Account details for ${credential.identifier} on ${platformName}. ${credential.description}`
        : `Account details for ${credential.identifier} on ${platformName}.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${credential.identifier} - ${platformName}`,
      description: credential.description
        ? `Account details for ${credential.identifier} on ${platformName}. ${credential.description}`
        : `Account details for ${credential.identifier} on ${platformName}.`,
    },
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
