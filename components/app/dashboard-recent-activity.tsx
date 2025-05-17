"use client"

import { RecentItem, RecentItemTypeEnum } from "@/schemas/utils"

import { formatDate } from "@/lib/utils"

import { getEntityIcon, Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardRecentActivityProps {
  recentItems: RecentItem[] // Use imported RecentItem type
}

function onAddItem(itemType: "account" | "card" | "secret") {
  console.log("Add item of type:", itemType)
  // e.g., router.push(`/dashboard/add-${itemType}`);
}

export function DashboardRecentActivity({
  recentItems,
}: DashboardRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentItems.length > 0 ? (
          <div className="space-y-4">
            {recentItems.map(
              (
                item: RecentItem // Use imported RecentItem type
              ) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        item.type === RecentItemTypeEnum.CREDENTIAL
                          ? "bg-blue-500/10 text-blue-500"
                          : item.type === RecentItemTypeEnum.CARD
                            ? "bg-green-500/10 text-green-500"
                            : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {getEntityIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {item.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.type === RecentItemTypeEnum.CREDENTIAL
                          ? item.entity?.username || "N/A"
                          : item.type === RecentItemTypeEnum.CARD
                            ? `${item.entity?.type || "Card"} •••• ${
                                item.entity?.number &&
                                String(item.entity.number).length >= 4
                                  ? String(item.entity.number).slice(-4)
                                  : "XXXX"
                              }`
                            : item.entity?.description || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {item.activityType} on {formatDate(item.lastActivityAt)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted rounded-full p-3">
              <Icons.add className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Add your first item to get started with VaultGuard
            </p>
            <Button onClick={() => onAddItem("account")} className="mt-4">
              Add your first item
            </Button>
          </div>
        )}
      </CardContent>
      {recentItems.length > 0 && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            View all activity
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
