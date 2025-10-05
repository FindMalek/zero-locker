"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlatformEntity } from "@/entities/utils/platform"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"

import { DateFormatter } from "@/lib/date-utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { CredentialActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CredentialGridViewProps {
  credentials: CredentialOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardCredentialGridView({
  credentials,
  platforms,
}: CredentialGridViewProps) {
  const router = useRouter()
  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1000,
  })

  const handleCardClick = (credentialId: string) => {
    router.push(`/dashboard/accounts/${credentialId}`)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {credentials.map((credential) => {
        const platform = PlatformEntity.findById(
          platforms,
          credential.platformId
        )

        return (
          <Card
            key={credential.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(credential.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary flex size-10 items-center justify-center rounded-full">
                    <Image
                      src={platform.logo || ""}
                      alt={`${platform.name} logo`}
                      width={24}
                      height={24}
                      className="size-6 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {credential.identifier}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {platform.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await copy(credential.identifier)
                    }}
                  >
                    {isCopied ? (
                      <Icons.check className="size-4" />
                    ) : (
                      <Icons.copy className="size-4" />
                    )}
                  </Button>

                  <CredentialActionsDropdown
                    credentialId={credential.id}
                    credentialIdentifier={credential.identifier}
                    // containerId={credential.containerId}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>
                    {credential.lastViewed
                      ? `Last viewed ${DateFormatter.formatShortDate(credential.lastViewed)}`
                      : `Created ${DateFormatter.formatShortDate(credential.createdAt)}`}
                  </span>
                  <StatusBadge status={credential.status} compact />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
