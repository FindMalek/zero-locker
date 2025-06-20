"use client"

import Link from "next/link"
import { useJoinWaitlist } from "@/orpc/hooks"
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

export function MarketingWaitlistForm({ count }: { count: number }) {
  const joinWaitlistMutation = useJoinWaitlist()

  const form = useForm<WaitlistUserDto>({
    resolver: zodResolver(WaitlistUserDtoSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: WaitlistUserDto) {
    joinWaitlistMutation.mutate(values, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("You've been added to our waitlist.")
          form.reset()
        } else {
          toast.error(result.error || "Something went wrong")
        }
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.")
      },
    })
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2 pt-4 sm:flex-row"
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
          <Button variant="outline" size="lg" asChild>
            <Link href={siteConfig.links.github}>
              <Icons.github />
            </Link>
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <div className="bg-success/70 animate-pulse rounded-full p-1" />
          <p className="text-success/70 text-sm">
            {count} people have joined the waitlist
          </p>
        </div>
      </Form>
    </div>
  )
}
