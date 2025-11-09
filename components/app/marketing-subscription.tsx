"use client"

import { useEffect, useState } from "react"
import { useSubscribeToUpdates } from "@/orpc/hooks/use-users"
import {
  subscriptionInputSchema,
  type SubscriptionInput,
} from "@/schemas/user/roadmap"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { handleErrors } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface MarketingSubscriptionProps {
  type: "roadmap" | "articles"
  successMessage?: string
  description?: string
}

export function MarketingSubscription({
  type,
  successMessage,
  description,
}: MarketingSubscriptionProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const subscribeToUpdatesMutation = useSubscribeToUpdates()

  const form = useForm<SubscriptionInput>({
    resolver: zodResolver(subscriptionInputSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle transition for success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setShowSuccess(false)
          setIsTransitioning(false)
        }, 300) // Wait for fade out animation
      }, 3000) // Show success for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  async function onSubmit(values: SubscriptionInput) {
    subscribeToUpdatesMutation.mutate(
      { email: values.email, type },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success("Successfully subscribed!", {
              description:
                successMessage || `You'll receive updates about our ${type}.`,
            })
            form.reset()

            // Show success indicator
            setShowSuccess(true)
            setIsTransitioning(false)
          } else {
            toast.error("Subscription failed", {
              description: result.error || "Something went wrong",
            })
          }
        },
        onError: (error) => {
          const { message } = handleErrors(error, "Something went wrong. Please try again.")
          toast.error("Subscription failed", {
            description: message,
          })
        },
      }
    )
  }

  const getDisplayText = () => {
    if (showSuccess) {
      return `You're now subscribed to ${type} updates!`
    }

    return description || `Stay updated on our latest ${type} and insights`
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2 sm:flex-row"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full sm:flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    disabled={subscribeToUpdatesMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={subscribeToUpdatesMutation.isPending}
          >
            {subscribeToUpdatesMutation.isPending && (
              <Icons.spinner className="size-4 animate-spin" />
            )}{" "}
            Subscribe
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <div
            className={`bg-success/70 rounded-full p-1 transition-opacity duration-300 ${
              showSuccess ? "animate-pulse" : "opacity-50"
            }`}
          />
          <p
            className={`text-success/70 text-sm transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {getDisplayText()}
          </p>
        </div>
      </Form>
    </div>
  )
}
