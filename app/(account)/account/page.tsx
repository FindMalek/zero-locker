import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { auth } from "@/lib/auth/server"

import { AccountGeneralClient } from "@/components/app/account-general-client"

export const metadata: Metadata = {
  title: "General",
}

export default async function AccountGeneralPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const context = await createContext()
  const serverClient = createServerClient(context)

  const userResponse = await serverClient.users.getCurrentUser({})

  return <AccountGeneralClient initialUser={userResponse} />
}
