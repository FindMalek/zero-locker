"use client"

import { cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AddItemDropdownProps {
  text?: string
  className?: string
  openAddItemDialog: (itemType: "account" | "card" | "secret") => void
}

export function AddItemDropdown({
  text,
  openAddItemDialog,
  className,
}: AddItemDropdownProps) {
  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <Button className={cn("w-full justify-start gap-2", className)}>
          <Icons.add className="h-4 w-4" />
          {text}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => openAddItemDialog("account")}>
          <Icons.user className="mr-2 h-4 w-4" />
          <span>New Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openAddItemDialog("card")}>
          <Icons.creditCard className="mr-2 h-4 w-4" />
          <span>New Payment Card</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openAddItemDialog("secret")}>
          <Icons.key className="mr-2 h-4 w-4" />
          <span>New Secure Note</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
