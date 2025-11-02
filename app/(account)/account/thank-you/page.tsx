import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/lib/auth/server"

import { AccountThankYouClient } from "@/components/app/account-thank-you-client"

export const metadata: Metadata = {
  title: "Thank You",
}

export default async function ThankYouPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <Suspense>
      <AccountThankYouClient />
    </Suspense>
  )
}

