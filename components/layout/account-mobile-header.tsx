"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { AccountSidebar, AccountSidebarContent } from "./account-sidebar"

export function AccountMobileHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === "/account") return "General"
    if (pathname.startsWith("/account/billing")) return "Billing"
    if (pathname.startsWith("/account/subscriptions")) return "Subscriptions"
    return "Account"
  }

  if (!isMobile) {
    return null
  }

  return (
    <>
      <header className="flex h-12 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="size-8"
        >
          <Icons.menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <h1 className="text-base font-semibold">{getPageTitle()}</h1>
      </header>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64 border-r border-border bg-sidebar p-0 sm:w-80">
          <SheetHeader className="sr-only">
            <SheetTitle>Account Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <AccountSidebarContent onNavigate={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

