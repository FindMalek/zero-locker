"use client"

import { Icons } from "@/components/shared/icons"
import { Skeleton } from "@/components/ui/skeleton"

export function AccountInvoiceDetailPreview() {
  return (
    <div
      className="bg-muted/20 relative mx-auto w-full"
      style={{ aspectRatio: "210 / 297" }}
    >
      <Skeleton className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8">
        <Icons.page className="text-muted-foreground size-12" />
        <p className="text-muted-foreground text-center text-sm font-medium">
          PDF preview placeholder
        </p>
        <p className="text-muted-foreground text-center text-xs">
          A4 format (210mm × 297mm)
        </p>
      </div>
    </div>
  )
}
