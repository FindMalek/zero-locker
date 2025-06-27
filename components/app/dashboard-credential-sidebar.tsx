"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"
import type { AccountStatus } from "@prisma/client"

import { formatDate } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CredentialSidebarProps {
  credential: CredentialOutput
  onStatusChange?: (status: AccountStatus) => void
  onContainerChange?: (containerId: string) => void
}

export function CredentialSidebar({
  credential,
  onContainerChange,
}: CredentialSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-medium">
                Status
              </Label>
            </div>
            <StatusBadge status={credential.status} />
          </div>
        </CardContent>
      </Card>

      {/* Container */}
      <div className="bg-muted/50 border-border space-y-3 rounded-lg border p-4">
        <Label className="text-foreground text-sm font-medium">Container</Label>
        <Select
          defaultValue={credential.containerId || "personal"}
          onValueChange={onContainerChange}
        >
          <SelectTrigger className="border-border focus:border-ring focus:ring-ring focus:ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal Vault</SelectItem>
            <SelectItem value="work">Work Credentials</SelectItem>
            <SelectItem value="shared">Shared Access</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Info */}
      <div className="bg-muted/50 border-border space-y-3 rounded-lg border p-4">
        <Label className="text-foreground text-sm font-medium">
          Quick Info
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Last Viewed</span>
            <span className="text-xs font-medium">
              {credential.lastViewed
                ? formatDate(credential.lastViewed)
                : "Never"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Created</span>
            <span className="text-xs font-medium">
              {formatDate(credential.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Last Updated</span>
            <span className="text-xs font-medium">
              {formatDate(credential.updatedAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Platform ID</span>
            <span className="bg-background border-border rounded border px-2 py-0.5 font-mono text-xs">
              {credential.platformId.slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Level */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50">
        <div className="mb-2 flex items-center gap-2">
          <Icons.shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            High Security
          </span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400">
          Encrypted with AES-256
        </p>
      </div>
    </div>
  )
}
