"use client"

import { useCurrentUser } from "@/orpc/hooks/use-users"
import { UserPlan } from "@prisma/client"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AccountPlanComparisonCard() {
  const { data: currentUser } = useCurrentUser()
  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const isPro = userPlan === UserPlan.PRO

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Comparison</CardTitle>
        <CardDescription>Compare Free and Pro plans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Free Plan</h3>
              {!isPro && <Badge variant="secondary">CURRENT</Badge>}
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Icons.check className="text-muted-foreground size-4" />
                <span>3 default containers</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="text-muted-foreground size-4" />
                <span>Basic features</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  No custom containers
                </span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pro Plan</h3>
              {isPro && <Badge variant="default">CURRENT</Badge>}
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Icons.check className="size-4 text-green-600" />
                <span>Unlimited containers</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="size-4 text-green-600" />
                <span>All premium features</span>
              </li>
              <li className="flex items-center gap-2">
                <Icons.check className="size-4 text-green-600" />
                <span>Priority support</span>
              </li>
            </ul>
            {!isPro && (
              <Button asChild className="mt-4 w-full">
                {/* TODO: Replace with actual Lemon Squeezy checkout link */}
                <a
                  href="https://app.lemonsqueezy.com/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upgrade to Pro
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
