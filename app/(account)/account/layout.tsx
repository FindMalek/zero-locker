import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/server"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardSiteHeader } from "@/components/layout/dashboard-site-header"
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

  const user = session.user

  return (
    <SidebarProvider>
      <DashboardSidebar variant="inset" user={user} />
      <SidebarInset>
        <DashboardSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
