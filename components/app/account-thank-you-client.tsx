"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function ThankYouContent() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get("subscription_id")
  const orderId = searchParams.get("order_id")

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="text-primary size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>
          <p className="text-muted-foreground max-w-md">
            Your subscription has been successfully activated. We appreciate
            your business!
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
              <p className="text-muted-foreground text-sm font-medium">
                Subscription ID
              </p>
              <p className="font-mono text-sm">{subscriptionId}</p>
            </div>
          )}
          {orderId && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Order ID
              </p>
              <p className="font-mono text-sm">{orderId}</p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              A confirmation email has been sent to your email address with all
              the details about your subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/account">
            <Icons.home className="mr-2 size-4" />
            Go to Account Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/account/subscription">
            <Icons.creditCard className="mr-2 size-4" />
            View Subscription
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/account/invoices">
            <Icons.post className="mr-2 size-4" />
            View Invoices
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 mt-0.5 flex size-6 items-center justify-center rounded-full">
              <span className="text-primary text-xs font-semibold">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Check your email</p>
              <p className="text-muted-foreground text-sm">
                You&apos;ll receive a confirmation email with your subscription
                details
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 mt-0.5 flex size-6 items-center justify-center rounded-full">
              <span className="text-primary text-xs font-semibold">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Access your account</p>
              <p className="text-muted-foreground text-sm">
                Manage your subscription and view billing history from your
                account dashboard
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 mt-0.5 flex size-6 items-center justify-center rounded-full">
              <span className="text-primary text-xs font-semibold">3</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Get started</p>
              <p className="text-muted-foreground text-sm">
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
