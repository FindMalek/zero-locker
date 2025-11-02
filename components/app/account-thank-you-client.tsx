"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/shared/icons"
import { CheckCircle2 } from "lucide-react"

function ThankYouContent() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get("subscription_id")
  const orderId = searchParams.get("order_id")

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>
          <p className="text-muted-foreground max-w-md">
            Your subscription has been successfully activated. We appreciate your business!
          </p>
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Your subscription information and next steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionId && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Subscription ID
              </p>
              <p className="text-sm font-mono">{subscriptionId}</p>
            </div>
          )}
          {orderId && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Order ID</p>
              <p className="text-sm font-mono">{orderId}</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with all the
              details about your subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        <Button asChild className="flex-1">
          <Link href="/account">
            <Icons.home className="mr-2 size-4" />
            Go to Account Dashboard
          </Link>
        </Button>
        {subscriptionId && (
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/account/subscriptions/${subscriptionId}`}>
              <Icons.fileText className="mr-2 size-4" />
              View Subscription Details
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild className="flex-1">
          <Link href="/account/billing">
            <Icons.creditCard className="mr-2 size-4" />
            Billing Settings
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll receive a confirmation email with your subscription details
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Access your account</p>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and view billing history from your account dashboard
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 mt-0.5">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Get started</p>
              <p className="text-sm text-muted-foreground">
                Start using all the features available in your subscription plan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AccountThankYouClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  )
}

