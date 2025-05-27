"use client"

import { CardDto } from "@/schemas/card"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CardFormProps {
  form: any // Using any to avoid complex type issues
  onCopyCvv: () => void
  isCopied: boolean
}

export function DashboardAddCardForm({
  form,
  onCopyCvv,
  isCopied,
}: CardFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Chase Sapphire, Work Card..."
              />
            </FormControl>
            <FormDescription>A name to identify this card</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardType.CREDIT}>Credit Card</SelectItem>
                  <SelectItem value={CardType.DEBIT}>Debit Card</SelectItem>
                  <SelectItem value={CardType.VIRTUAL}>Virtual Card</SelectItem>
                  <SelectItem value={CardType.NATIONAL}>
                    National Card
                  </SelectItem>
                  <SelectItem value={CardType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardProvider.VISA}>Visa</SelectItem>
                  <SelectItem value={CardProvider.MASTERCARD}>
                    Mastercard
                  </SelectItem>
                  <SelectItem value={CardProvider.AMEX}>
                    American Express
                  </SelectItem>
                  <SelectItem value={CardProvider.DISCOVER}>
                    Discover
                  </SelectItem>
                  <SelectItem value={CardProvider.DINERS_CLUB}>
                    Diners Club
                  </SelectItem>
                  <SelectItem value={CardProvider.JCB}>JCB</SelectItem>
                  <SelectItem value={CardProvider.UNIONPAY}>
                    UnionPay
                  </SelectItem>
                  <SelectItem value={CardProvider.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="1234 5678 9012 3456" />
            </FormControl>
            <FormDescription>
              Your card number (will be encrypted)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="MM/YY"
                  value={
                    field.value
                      ? new Date(field.value).toLocaleDateString("en-US", {
                          month: "2-digit",
                          year: "2-digit",
                        })
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.match(/^\d{2}\/\d{2}$/)) {
                      const [month, year] = value.split("/")
                      const fullYear =
                        parseInt(year) < 50 ? `20${year}` : `19${year}`
                      field.onChange(new Date(`${fullYear}-${month}-01`))
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cvv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CVV</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    variant="password"
                    type="number"
                    {...field}
                    placeholder="123"
                  />
                </FormControl>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={CardStatus.EXPIRED}>Expired</SelectItem>
                  <SelectItem value={CardStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={CardStatus.LOST}>Lost</SelectItem>
                  <SelectItem value={CardStatus.STOLEN}>Stolen</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cardholderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cardholder Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="John Doe" />
            </FormControl>
            <FormDescription>Name as it appears on the card</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="billingAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Billing Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="123 Main St, City, State 12345" />
            </FormControl>
            <FormDescription>
              Billing address associated with this card
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="cardholderEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="john@example.com" />
              </FormControl>
              <FormDescription>
                Email associated with this card (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Primary credit card, Business expenses..."
                />
              </FormControl>
              <FormDescription>
                Optional description to help identify this card
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
