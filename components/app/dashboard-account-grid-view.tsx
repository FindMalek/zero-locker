"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { AccountStatus } from "@prisma/client"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Icons} from "@/components/shared/icons"

interface AccountGridViewProps {
  credentials: CredentialOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardAccountGridView({
  credentials,
  platforms,
}: AccountGridViewProps) {
  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-xs text-green-800"
          >
            Active
          </Badge>
        )
      case AccountStatus.SUSPENDED:
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-xs text-yellow-800"
          >
            Suspended
          </Badge>
        )
      case AccountStatus.DELETED:
        return (
          <Badge variant="destructive" className="text-xs">
            Deleted
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId)
    return platform?.name || "Unknown Platform"
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {credentials.map((credential) => (
        <Card key={credential.id} className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Icons.user className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="max-w-[150px] truncate text-sm font-semibold">
                    {credential.identifier}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getPlatformName(credential.platformId)}
                  </p>
                </div>
              </div>
              {getStatusBadge(credential.status)}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {credential.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {credential.description}
              </p>
            )}

            <div className="mb-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>
                  {format(new Date(credential.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Viewed:</span>
                <span>
                  {credential.lastViewed
                    ? format(new Date(credential.lastViewed), "MMM dd, yyyy")
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(credential.identifier)}
                className="h-8 w-8 p-0"
              >
                <Icons.copy className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Icons.more className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Icons.eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Icons.trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
