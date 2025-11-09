"use client"

import Link from "next/link"
import { toast } from "sonner"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { AccountPageHeader } from "@/components/app/account-page-header"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

interface AccountInvoiceDetailHeaderProps {
  invoiceNumber: string
  invoiceId: string
}

export function AccountInvoiceDetailHeader({
  invoiceNumber,
  invoiceId,
}: AccountInvoiceDetailHeaderProps) {
  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 2000,
  })

  const handleDownload = () => {
    // TODO: Implement invoice PDF download
    toast.info("Invoice download will be available soon")
  }

  const handleCopyPdfLink = async () => {
    // TODO: Replace with actual PDF URL when available
    const pdfUrl = `${window.location.origin}/api/invoices/${invoiceId}/pdf`
    const success = await copy(pdfUrl)
    if (success) {
      toast.success("PDF link copied to clipboard")
    } else {
      toast.error("Failed to copy PDF link")
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/account/invoices">
        <Button variant="ghost" size="sm" className="gap-2">
          <Icons.chevronLeft className="size-4" />
          Back to Invoices
        </Button>
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <AccountPageHeader
            title={`Invoice #${invoiceNumber}`}
            description="Invoice details and billing information"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Icons.down className="size-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPdfLink}
            className="gap-2"
          >
            <Icons.copy className="size-4" />
            {isCopied ? "Copied!" : "Copy PDF Link"}
          </Button>
        </div>
      </div>
    </div>
  )
}
