import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/server"

import { AccountMobileHeader } from "@/components/layout/account-mobile-header"
import { AccountSidebar } from "@/components/layout/account-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "28rem",
        } as React.CSSProperties
      }
    >
      <AccountMobileHeader />
      <AccountSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10 lg:py-12">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
