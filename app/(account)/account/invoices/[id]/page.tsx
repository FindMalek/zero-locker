import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { auth } from "@/lib/auth/server"

import { AccountInvoiceDetailClient } from "@/components/app/account-invoice-detail-client"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Invoice Details`,
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const context = await createContext()
  const serverClient = createServerClient(context)

  try {
    const invoiceResponse = await serverClient.subscriptions.getInvoice({ id })

    return (
      <AccountInvoiceDetailClient
        invoiceId={id}
        initialData={invoiceResponse}
      />
    )
  } catch {
    notFound()
  }
}
