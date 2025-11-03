"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Sidebar } from "@/components/ui/sidebar"

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
    title: "Billing",
    href: "/account/billing",
    icon: <Icons.creditCard className="size-5" />,
  },
  {
    title: "Subscriptions",
    href: "/account/subscriptions",
    icon: <Icons.calendar className="size-5" />,
  },
]

interface AccountSidebarProps {
  onNavigate?: () => void
}

function AccountSidebarContent({ onNavigate }: AccountSidebarProps) {
  const pathname = usePathname()

  return (
    <nav className="p-6">
      <ul className="space-y-1">
        {accountNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
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
