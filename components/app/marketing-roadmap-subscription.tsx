"use client"

import { useEffect, useState } from "react"
import { useSubscribeToRoadmap } from "@/orpc/hooks"
import {
  roadmapSubscribeInputSchema,
  type RoadmapSubscribeInput,
} from "@/schemas/user/roadmap"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { handleORPCError } from "@/lib/utils"

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

export function MarketingRoadmapSubscription() {
  const subscribeToRoadmapMutation = useSubscribeToRoadmap()

  const [showSuccess, setShowSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const form = useForm<RoadmapSubscribeInput>({
    resolver: zodResolver(roadmapSubscribeInputSchema),
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

  async function onSubmit(values: RoadmapSubscribeInput) {
    subscribeToRoadmapMutation.mutate(values, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Successfully subscribed!", {
            description: "You'll receive updates about our roadmap.",
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
        const { description } = handleORPCError(error)

        toast.error("Subscription failed", {
          description,
        })
      },
    })
  }

  const getDisplayText = () => {
    if (showSuccess) {
      return "You're now subscribed to roadmap updates!"
    }

    return "Stay updated on our progress and upcoming features"
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
                    disabled={subscribeToRoadmapMutation.isPending}
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
            disabled={subscribeToRoadmapMutation.isPending}
          >
            {subscribeToRoadmapMutation.isPending && (
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
