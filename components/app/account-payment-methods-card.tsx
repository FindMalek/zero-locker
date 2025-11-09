"use client"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AccountPaymentMethodsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods through Lemon Squeezy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" asChild className="w-full">
          <a
            href="https://app.lemonsqueezy.com/customer-portal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icons.creditCard className="mr-2 size-4" />
            Manage Payment Methods
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
