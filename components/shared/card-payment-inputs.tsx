"use client"

import React, { useId, useState } from "react"
import { CardEntity } from "@/entities"
import { LIST_CARD_PROVIDERS, type CardProviderInfer } from "@/schemas/card"
import { usePaymentInputs } from "react-payment-inputs"

import { CARD_TYPE_MAPPING } from "@/config/consts"

import { CardIcon } from "@/components/shared/card-icon"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

interface CardPaymentInputsProps {
  onCardNumberChange?: (value: string) => void
  onExpiryChange?: (value: string) => void
  onCVCChange?: (value: string) => void
  onCardTypeChange?: (cardType: CardProviderInfer) => void
  className?: string
  disabled?: boolean
}

export function CardPaymentInputs({
  onCardNumberChange,
  onExpiryChange,
  onCVCChange,
  onCardTypeChange,
  className,
  disabled = false,
}: CardPaymentInputsProps) {
  const id = useId()
  const [manualCardType, setManualCardType] =
    useState<CardProviderInfer | null>(null)

  const { meta, getCardNumberProps, getExpiryDateProps, getCVCProps } =
    usePaymentInputs()

  const convertCardType = (
    cardType: string | undefined
  ): CardProviderInfer | null => {
    if (!cardType) return null
    return CARD_TYPE_MAPPING[cardType.toLowerCase()] || null
  }

  const effectiveCardType =
    manualCardType || convertCardType(meta.cardType?.type)

  React.useEffect(() => {
    if (effectiveCardType) {
      onCardTypeChange?.(effectiveCardType)
    }
  }, [effectiveCardType, onCardTypeChange])

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
            name={`vault-card-number-${id}`}
            disabled={disabled}
            placeholder="1234 5678 9012 3456"
            autoComplete="off"
            data-form-type="other"
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
            <div className="pointer-events-auto relative">
              <Select
                value={manualCardType || ""}
                onValueChange={handleManualCardTypeChange}
                disabled={disabled}
              >
                <SelectTrigger
                  className="h-auto w-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
                  hideIcon
                >
                  <CardIcon
                    manualCardType={manualCardType}
                    detectedCardType={meta.cardType?.type}
                  />
                </SelectTrigger>
                <SelectContent>
                  {LIST_CARD_PROVIDERS.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center gap-2">
                        <CardIcon
                          manualCardType={provider}
                          showManualIndicator={false}
                        />
                        {CardEntity.convertCardProviderToString(provider)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              name={`vault-card-expiry-${id}`}
              disabled={disabled}
              placeholder="MM/YY"
              autoComplete="off"
              data-form-type="other"
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
              name={`vault-card-cvc-${id}`}
              disabled={disabled}
              placeholder="123"
              autoComplete="off"
              data-form-type="other"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
