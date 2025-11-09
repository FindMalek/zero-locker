"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { signOut } from "@/lib/auth/client"
import { checkIsActive, cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface AccountNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const accountNavItems: AccountNavItem[] = [
  {
    title: "General",
    href: "/account",
    icon: <Icons.user className="size-5" />,
  },
  {
    title: "Subscription",
    href: "/account/subscription",
    icon: <Icons.creditCard className="size-5" />,
  },
  {
    title: "Invoices",
    href: "/account/invoices",
    icon: <Icons.post className="size-5" />,
  },
]

interface AccountSidebarProps {
  onNavigate?: () => void
}

function AccountSidebarContent({ onNavigate }: AccountSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  return (
    <>
      <SidebarContent>
        <nav className="p-6">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className={buttonVariants({
                  variant: "ghost",
                  className: "w-full justify-start",
                })}
              >
                <Icons.home className="size-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <SidebarSeparator className="my-4" />
            {accountNavItems.map((item) => {
              const isActive = checkIsActive(pathname, item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {isActive && <Icons.chevronRight className="size-5" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </SidebarContent>
      <SidebarSeparator className="my-4" />
      <SidebarFooter className="px-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className={buttonVariants({
                variant: "ghost",
                className: "text-destructive w-full justify-start",
              })}
            >
              <Icons.logOut className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

export function AccountSidebar({ onNavigate }: AccountSidebarProps) {
  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="hidden md:block"
      style={
        {
          "--sidebar-width": "28rem",
        } as React.CSSProperties
      }
    >
      <AccountSidebarContent onNavigate={onNavigate} />
    </Sidebar>
  )
}

export { AccountSidebarContent }
