"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { AccountStatus } from "@prisma/client"
import { format } from "date-fns"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AccountListViewProps {
  credentials: CredentialOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardAccountListView({
  credentials,
  platforms,
}: AccountListViewProps) {
  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case AccountStatus.SUSPENDED:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Suspended
          </Badge>
        )
      case AccountStatus.DELETED:
        return <Badge variant="destructive">Deleted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
    <div className="space-y-4">
      {credentials.map((credential) => (
        <Card key={credential.id} className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-lg font-semibold">
                    {credential.identifier}
                  </h3>
                  {getStatusBadge(credential.status)}
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
                  <div>
                    <span className="font-medium">Platform:</span>{" "}
                    {getPlatformName(credential.platformId)}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {format(new Date(credential.createdAt), "MMM dd, yyyy")}
                  </div>
                  <div>
                    <span className="font-medium">Last Viewed:</span>{" "}
                    {credential.lastViewed
                      ? format(new Date(credential.lastViewed), "MMM dd, yyyy")
                      : "Never"}
                  </div>
                </div>

                {credential.description && (
                  <p className="mt-2 text-gray-600">{credential.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
