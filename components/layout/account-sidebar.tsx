"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/shared/icons"

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

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-background">
      <nav className="p-6">
        <ul className="space-y-1">
          {accountNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors",
                    isActive
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
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
    </aside>
  )
}

