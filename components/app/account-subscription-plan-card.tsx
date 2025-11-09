"use client"

import Link from "next/link"

import type { PlanInfo } from "@/lib/permissions"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {cn} from "@/lib/utils"

interface AccountSubscriptionPlanCardProps {
  plan: PlanInfo
  isCurrent: boolean
}

export function AccountSubscriptionPlanCard({
  plan,
  isCurrent,
}: AccountSubscriptionPlanCardProps) {
  const getPrice = () => {
    if (plan.pricing.monthly === null) return "Custom"
    return `$${plan.pricing.monthly}`
  }

  const getPriceSuffix = () => {
    if (plan.pricing.monthly === null) return ""
    return "/month"
  }

  const getCtaText = () => {
    if (isCurrent) {
      return "Current Plan"
    }
    return plan.cta.text
  }

  const renderCtaButton = () => {
    const ctaText = getCtaText()
    const isDisabled = isCurrent || plan.isComingSoon || !plan.isAvailable

    if (plan.cta.href && !isCurrent) {
      const isExternal = plan.cta.href.startsWith("http")

      if (isExternal) {
        return (
          <Button
            variant={isCurrent ? "default" : plan.cta.variant}
            className={cn("mb-6 w-full", {
              "bg-primary text-primary-foreground hover:bg-primary/90": isCurrent,
            })}
            size="sm"
            asChild
            disabled={isDisabled}
          >
            <a href={plan.cta.href} target="_blank" rel="noopener noreferrer">
              {ctaText}
            </a>
          </Button>
        )
      }

      return (
        <Button
          variant={isCurrent ? "default" : plan.cta.variant}
          className={cn("mb-6 w-full", {
            "bg-primary text-primary-foreground hover:bg-primary/90": isCurrent,
            })}
          size="sm"
          asChild
          disabled={isDisabled}
        >
          <Link href={plan.cta.href}>{ctaText}</Link>
        </Button>
      )
    }

    return (
      <Button
        variant={isCurrent ? "default" : plan.cta.variant}
        className={cn("mb-6 w-full", {
          "bg-primary text-primary-foreground hover:bg-primary/90": isCurrent,
        })}
        size="sm"
        onClick={plan.cta.onClick}
        disabled={isDisabled}
      >
        {ctaText}
      </Button>
    )
  }

  return (
    <div
      className={cn("relative flex flex-col rounded-lg border p-4 transition-all", {
          "border-primary/40 ring-primary/20 bg-primary/5 ring-2": isCurrent,
          "border-muted-foreground/10 opacity-60": plan.isComingSoon,
          "border-muted-foreground/20 hover:border-foreground/20": !isCurrent && !plan.isComingSoon,
        })}
    >
      {/* Current Plan Badge - Top Right */}
      {isCurrent && (
        <div className="absolute right-4 top-4">
          <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2.5 py-1 text-xs font-semibold">
            Current Plan
          </span>
        </div>
      )}

      {/* Coming Soon Badge */}
      {plan.isComingSoon && (
        <div className="absolute right-4 top-4">
          <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-xs font-semibold">
            Coming Soon
          </span>
        </div>
      )}

      {/* Plan Name & Price */}
      <div className="mb-6">
        <h3
          className={cn("mb-1 text-xl font-semibold", {
            "text-primary": isCurrent,
            "text-foreground": !isCurrent,
          })}
        >
          {plan.name}
        </h3>
        <p className="text-muted-foreground mb-4 min-h-[2.5rem] text-xs">
          {plan.description}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className={cn("text-3xl font-bold", {
              "text-primary": isCurrent,
              "text-foreground": !isCurrent,
            })}
          >
            {getPrice()}
          </span>
          {plan.pricing.monthly !== null && (
            <span className="text-muted-foreground text-xs">
              {getPriceSuffix()}
            </span>
          )}
        </div>
      </div>

      {/* CTA Button */}
      {renderCtaButton()}

      {/* Features List */}
      <div className="space-y-2.5 text-sm">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            {feature.available ? (
              <Icons.check
                className={cn("mt-0.5 h-4 w-4 flex-shrink-0", {
                  "text-success": isCurrent,
                  "text-success/70": !isCurrent,
                })}
              />
            ) : (
              <span className="h-4 w-4 flex-shrink-0" />
            )}
            <span
              className={cn("leading-snug", {
                "text-foreground/75": feature.available && isCurrent,
                "text-muted-foreground": !feature.available,
              })}
            >
              {feature.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
