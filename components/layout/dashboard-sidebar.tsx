import * as React from "react"
import Link from "next/link"

import { User as UserType } from "@/types"

import { siteConfig } from "@/config/site"

import { DashboardNavUser } from "@/components/layout/dashboard-nav-user"
import { DashboardSidebarMenuItemComponent } from "@/components/layout/dashboard-sidebar-menu-item"
import { Icons } from "@/components/shared/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserType
}

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Icons.logo className="h-5 w-5" />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarSeparator />

              <DashboardSidebarMenuItemComponent
                href="/dashboard"
                icon={<Icons.home className="h-4 w-4" />}
                label="Overview"
              />

              <SidebarSeparator />

              <DashboardSidebarMenuItemComponent
                href="/dashboard/accounts"
                icon={<Icons.user className="h-4 w-4" />}
                label="Accounts"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/cards"
                icon={<Icons.creditCard className="h-4 w-4" />}
                label="Payment Cards"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/secrets"
                icon={<Icons.key className="h-4 w-4" />}
                label="Secure Notes"
              />

              <SidebarSeparator />

              <DashboardSidebarMenuItemComponent
                href="/dashboard/logs"
                icon={<Icons.logs className="h-4 w-4" />}
                label="Logs"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
