"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Shield, Plus, ChevronDown } from "lucide-react"
import { CardDto } from "@/schemas/card"
import { TagDto } from "@/schemas/tag"
import { CardProvider, CardStatus, CardType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { TagSelector, getRandomSoftColor } from "@/components/shared/tag-selector"
import { cn } from "@/lib/utils"

// Card provider detection
const detectCardProvider = (number: string) => {
  const cleaned = number.replace(/\s/g, "")
  if (cleaned.match(/^4/)) return CardProvider.VISA
  if (cleaned.match(/^5[1-5]/) || cleaned.match(/^2[2-7]/)) return CardProvider.MASTERCARD
  if (cleaned.match(/^3[47]/)) return CardProvider.AMEX
  if (cleaned.match(/^6/)) return CardProvider.DISCOVER
  return CardProvider.OTHER
}

// Format card number with spaces
const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\s/g, "")
  const match = cleaned.match(/\d{1,4}/g)
  return match ? match.join(" ") : ""
}

// Format expiry date
const formatExpiryDate = (value: string) => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + (cleaned.length > 2 ? "/" + cleaned.substring(2, 4) : "")
  }
  return cleaned
}

interface CardFormProps {
  form: any // Using any to avoid complex type issues with the updated schema
  availableTags: TagDto[]
  onCopyCvv?: () => void
  isCopied?: boolean
}

export function DashboardAddCardForm({ 
  form, 
  availableTags,
  onCopyCvv,
  isCopied = false 
}: CardFormProps) {
  const [showCvv, setShowCvv] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)

  const watchedNumber = form.watch("number")

  useEffect(() => {
    if (watchedNumber) {
      const detected = detectCardProvider(watchedNumber)
      if (detected !== CardProvider.OTHER) {
        form.setValue("provider", detected)
      }
    }
  }, [watchedNumber, form])

  const hasMetadataValues = () => {
    const values = form.getValues()
    return !!(values.billingAddress || values.cardholderEmail || values.notes || values.status !== CardStatus.ACTIVE)
  }

  const getMetadataLabels = () => {
    const values = form.getValues()
    const labels = []
    if (values.billingAddress) labels.push("Address")
    if (values.cardholderEmail) labels.push("Email")
    if (values.notes) labels.push("Notes")
    if (values.status !== CardStatus.ACTIVE) labels.push("Status")
    return labels.slice(0, 2).join(", ") + (labels.length > 2 ? "..." : "")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Chase Sapphire" />
              </FormControl>
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
                <Input {...field} placeholder="e.g., Work card" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardType.CREDIT}>Credit</SelectItem>
                  <SelectItem value={CardType.DEBIT}>Debit</SelectItem>
                  <SelectItem value={CardType.VIRTUAL}>Virtual</SelectItem>
                  <SelectItem value={CardType.NATIONAL}>National</SelectItem>
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
              <FormLabel>Provider</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CardProvider.VISA}>Visa</SelectItem>
                  <SelectItem value={CardProvider.MASTERCARD}>Mastercard</SelectItem>
                  <SelectItem value={CardProvider.AMEX}>American Express</SelectItem>
                  <SelectItem value={CardProvider.DISCOVER}>Discover</SelectItem>
                  <SelectItem value={CardProvider.DINERS_CLUB}>Diners Club</SelectItem>
                  <SelectItem value={CardProvider.JCB}>JCB</SelectItem>
                  <SelectItem value={CardProvider.UNIONPAY}>UnionPay</SelectItem>
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
              <Input
                {...field}
                placeholder="1234 5678 9012 3456"
                className="font-mono"
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  if (formatted.replace(/\s/g, "").length <= 19) {
                    field.onChange(formatted)
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
        name="cardholderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cardholder Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="John Doe"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="MM/YY"
                  className="font-mono"
                  value={
                    field.value
                      ? new Date(field.value).toLocaleDateString("en-US", {
                          month: "2-digit",
                          year: "2-digit",
                        })
                      : ""
                  }
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value)
                    if (formatted.length <= 5) {
                      if (formatted.match(/^\d{2}\/\d{2}$/)) {
                        const [month, year] = formatted.split("/")
                        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
                        field.onChange(new Date(`${fullYear}-${month}-01`))
                      }
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
                    {...field}
                    type={showCvv ? "text" : "password"}
                    placeholder="123"
                    className="font-mono"
                    maxLength={4}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCvv(!showCvv)} 
                  className="px-2"
                >
                  {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {onCopyCvv && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCopyCvv}
                    className="px-2"
                  >
                    {isCopied ? "✓" : "📋"}
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tags */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <TagSelector<TagDto>
                availableTags={availableTags}
                selectedTags={field.value}
                onChange={field.onChange}
                getValue={(tag) => tag.name}
                getLabel={(tag) => tag.name}
                createTag={(name) => ({
                  name,
                  color: getRandomSoftColor(),
                  userId: undefined,
                  containerId: undefined,
                })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "hover:bg-muted/50 flex w-full items-center justify-between p-4",
              showMetadata && "bg-muted/55",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Additional Information</span>
              </div>
              {hasMetadataValues() && (
                <Badge variant="secondary" className="text-xs">
                  {getMetadataLabels()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{showMetadata ? "Hide" : "Optional"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showMetadata ? "rotate-180" : ""}`} />
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div className="bg-muted/55 p-4 space-y-4">
            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St, City, State 12345" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cardholderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john@example.com" />
                    </FormControl>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CardStatus.ACTIVE}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value={CardStatus.EXPIRED}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Expired
                          </div>
                        </SelectItem>
                        <SelectItem value={CardStatus.INACTIVE}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value={CardStatus.LOST}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Lost
                          </div>
                        </SelectItem>
                        <SelectItem value={CardStatus.STOLEN}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            Stolen
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Additional notes about this card..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
