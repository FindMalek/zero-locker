"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useJoinWaitlist, useWaitlistCount } from "@/orpc/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { WaitlistUserDtoSchema, type WaitlistUserDto } from "@/config/schema"
import { siteConfig } from "@/config/site"

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

export function MarketingWaitlistForm() {
  const joinWaitlistMutation = useJoinWaitlist()
  const { data: waitlistData, isLoading } = useWaitlistCount()

  const [showPosition, setShowPosition] = useState(false)
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const displayCount = waitlistData?.total ?? 0

  const form = useForm<WaitlistUserDto>({
    resolver: zodResolver(WaitlistUserDtoSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle transition back to total count
  useEffect(() => {
    if (showPosition && userPosition) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setShowPosition(false)
          setUserPosition(null)
          setIsTransitioning(false)
        }, 300) // Wait for fade out animation
      }, 3000) // Show position for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [showPosition, userPosition])

  async function onSubmit(values: WaitlistUserDto) {
    joinWaitlistMutation.mutate(values, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("You've been added to our waitlist.")
          form.reset()

          // Show user's position
          if (result.position) {
            setUserPosition(result.position)
            setShowPosition(true)
            setIsTransitioning(false)
          }
        } else {
          toast.error(result.error || "Something went wrong")
        }
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.")
      },
    })
  }

  const getDisplayText = () => {
    if (isLoading) return "Loading..."

    if (showPosition && userPosition) {
      return `You are number #${userPosition} in the waitlist!`
    }

    return `${displayCount} people have joined the waitlist`
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2 pt-4 sm:flex-row"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full sm:w-auto sm:flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email"
                    disabled={joinWaitlistMutation.isPending}
                    className="min-w-sm"
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
            disabled={joinWaitlistMutation.isPending}
            size="lg"
          >
            {joinWaitlistMutation.isPending && (
              <Icons.spinner className="size-4 animate-spin" />
            )}{" "}
            Join Waitlist
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href={siteConfig.links.github}>
              <Icons.github />
              <span className="sm:hidden">Star us on GitHub</span>
            </Link>
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <div className="bg-success/70 animate-pulse rounded-full p-1" />
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
