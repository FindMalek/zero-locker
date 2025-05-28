"use client"

import React, { useId, useState } from "react"
import { CardEntity } from "@/entities/card/entity"
import { CardProviderInfer, LIST_CARD_PROVIDERS } from "@/schemas/card"
import { CreditCard } from "lucide-react"
import { usePaymentInputs } from "react-payment-inputs"
import images, { type CardImages } from "react-payment-inputs/images"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CardPaymentInputsProps {
  onCardNumberChange?: (value: string) => void
  onExpiryChange?: (value: string) => void
  onCVCChange?: (value: string) => void
  onCardTypeChange?: (cardType: CardProviderInfer) => void
  cardNumber?: string
  expiry?: string
  cvc?: string
  className?: string
  disabled?: boolean
}

export function CardPaymentInputs({
  onCardNumberChange,
  onExpiryChange,
  onCVCChange,
  onCardTypeChange,
  cardNumber,
  expiry,
  cvc,
  className,
  disabled = false,
}: CardPaymentInputsProps) {
  const id = useId()
  const [manualCardType, setManualCardType] =
    useState<CardProviderInfer | null>(null)
  const {
    meta,
    getCardNumberProps,
    getExpiryDateProps,
    getCVCProps,
    getCardImageProps,
  } = usePaymentInputs()

  // Determine if we should show manual selection
  const shouldShowManualSelection =
    !meta.cardType && cardNumber && cardNumber.length > 4

  // Use manual selection if available, otherwise use detected type
  const effectiveCardType =
    manualCardType || (meta.cardType?.type as CardProviderInfer)

  // Notify parent of card type changes
  React.useEffect(() => {
    if (effectiveCardType) {
      onCardTypeChange?.(effectiveCardType)
    }
  }, [effectiveCardType, onCardTypeChange])

  // Reset manual selection when card number changes and type is detected
  React.useEffect(() => {
    if (meta.cardType?.type && manualCardType) {
      setManualCardType(null)
    }
  }, [meta.cardType?.type, manualCardType])

  const handleManualCardTypeChange = (value: CardProviderInfer) => {
    setManualCardType(value)
  }

  return (
    <div className={`min-w-[300px] space-y-2 ${className || ""}`}>
      <div className="rounded-lg shadow-sm shadow-black/5">
        <div className="relative focus-within:z-10">
          <Input
            className="peer rounded-b-none pe-9 shadow-none [direction:inherit]"
            {...getCardNumberProps({
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                onCardNumberChange?.(e.target.value)
              },
            })}
            id={`number-${id}`}
            disabled={disabled}
            placeholder="1234 5678 9012 3456"
            value={cardNumber || ""}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
            {meta.cardType ? (
              <svg
                className="overflow-hidden rounded-sm"
                {...getCardImageProps({
                  images: images as unknown as CardImages,
                })}
                width={20}
              />
            ) : shouldShowManualSelection ? (
              <div className="pointer-events-auto">
                <Select
                  value={manualCardType || ""}
                  onValueChange={handleManualCardTypeChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-6 w-16 border-0 bg-transparent p-0 text-xs shadow-none">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIST_CARD_PROVIDERS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {CardEntity.convertCardProviderToString(provider)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <CreditCard size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </div>
        </div>
        <div className="-mt-px flex">
          <div className="min-w-0 flex-1 focus-within:z-10">
            <Input
              className="rounded-e-none rounded-t-none shadow-none [direction:inherit]"
              {...getExpiryDateProps({
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onExpiryChange?.(e.target.value)
                },
              })}
              id={`expiry-${id}`}
              disabled={disabled}
              placeholder="MM/YY"
              value={expiry || ""}
            />
          </div>
          <div className="-ms-px min-w-0 flex-1 focus-within:z-10">
            <Input
              className="rounded-s-none rounded-t-none shadow-none [direction:inherit]"
              {...getCVCProps({
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onCVCChange?.(e.target.value)
                },
              })}
              id={`cvc-${id}`}
              disabled={disabled}
              placeholder="123"
              value={cvc || ""}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
