import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/server"

import { AccountSidebar } from "@/components/layout/account-sidebar"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen w-full">
      <AccountSidebar />
      <main className="flex-1 bg-card">
        <div className="mx-auto max-w-4xl px-10 py-12">
          {children}
        </div>
      </main>
    </div>
  )
}
