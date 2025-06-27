"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCredential } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"

import {
  getLogoDevUrlWithToken,
  getPlaceholderImage,
  getRelativeTime,
} from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { DashboardAccountDetailSkeleton } from "@/components/app/dashboard-account-detail-skeleton"
import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { TagDisplay } from "@/components/shared/tag-display"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountDetailViewProps {
  credentialId: string
  initialData?: {
    credential: CredentialOutput
    platforms: ListPlatformsOutput
  }
}

export function AccountDetailView({
  credentialId,
  initialData,
}: AccountDetailViewProps) {
  const router = useRouter()
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const { data: credential, isLoading, error } = useCredential(credentialId)
  const { data: platforms } = usePlatforms(
    { page: 1, limit: 100 },
    {
      initialData: initialData?.platforms,
    }
  )

  const handleCopyIdentifier = async (identifier: string) => {
    await copy(identifier)
  }

  if (isLoading) {
    return <DashboardAccountDetailSkeleton />
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <Icons.warning className="h-4 w-4" />
          <AlertTitle>Account not found</AlertTitle>
          <AlertDescription>
            The account you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} variant="outline">
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    )
  }

  const platform = platforms?.platforms?.find(
    (p) => p.id === credential.platformId
  ) || {
    id: credential.platformId,
    name: "Unknown Platform",
    logo: "",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={getPlaceholderImage(
              platform.name,
              getLogoDevUrlWithToken(platform.logo)
            )}
            alt={`${platform.name} logo`}
            width={64}
            height={64}
            className="bg-secondary size-16 rounded-full object-contain p-3"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{credential.identifier}</h1>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleCopyIdentifier(credential.identifier)}
              >
                {isCopied ? (
                  <Icons.check className="h-4 w-4" />
                ) : (
                  <Icons.copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <span>{platform.name}</span>
              <Separator orientation="vertical" className="h-4" />
              <StatusBadge status={credential.status} />
            </div>
          </div>
        </div>

        <ItemActionsDropdown
          onEdit={() => {
            // TODO: Implement edit
          }}
          onShare={() => {
            // TODO: Implement share
          }}
          onDuplicate={() => {
            // TODO: Implement duplicate
          }}
          onMove={() => {
            // TODO: Implement move
          }}
          onArchive={() => {
            // TODO: Implement archive
          }}
          onDelete={() => {
            // TODO: Implement delete
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.user className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Username/Email
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-sm">
                  {credential.identifier}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyIdentifier(credential.identifier)}
                >
                  {isCopied ? (
                    <Icons.check className="h-3 w-3" />
                  ) : (
                    <Icons.copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {credential.description && (
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Description
                </label>
                <p className="mt-1 text-sm">{credential.description}</p>
              </div>
            )}

            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={credential.status} />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Platform
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Image
                  src={getPlaceholderImage(
                    platform.name,
                    getLogoDevUrlWithToken(platform.logo)
                  )}
                  alt={`${platform.name} logo`}
                  width={20}
                  height={20}
                  className="bg-secondary size-5 rounded object-contain p-1"
                />
                <span className="text-sm">{platform.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags & Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.badgeCheck className="h-5 w-5" />
              Tags & Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Tags
              </label>
              <div className="mt-2">
                <TagDisplay tags={[]} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.clock className="h-5 w-5" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Created
              </label>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Icons.calendar className="h-4 w-4" />
                <span>{getRelativeTime(credential.createdAt)}</span>
              </div>
            </div>

            {credential.lastViewed && (
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Last Viewed
                </label>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Icons.clock className="h-4 w-4" />
                  <span>{getRelativeTime(credential.lastViewed)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Last Updated
              </label>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Icons.pencil className="h-4 w-4" />
                <span>{getRelativeTime(credential.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.creditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Password</span>
              </div>
              <Badge variant="secondary">Encrypted</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.shield className="h-4 w-4" />
                <span className="text-sm font-medium">2FA</span>
              </div>
              <Badge variant="outline">Not configured</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
