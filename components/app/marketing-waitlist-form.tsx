"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { WaitlistUserDtoSchema, type WaitlistUserDto } from "@/config/schema"

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

import { joinWaitlist } from "@/actions/user"

export function MarketingWaitlistForm() {
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<WaitlistUserDto>({
    resolver: zodResolver(WaitlistUserDtoSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: WaitlistUserDto) {
    setIsLoading(true)

    try {
      const result = await joinWaitlist(values)

      if (result.success) {
        toast.success("You've been added to our waitlist.")
        form.reset()
      } else {
        toast.error(result.error || "Something went wrong")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:whitespace-nowrap lg:text-4xl xl:text-5xl">
        Simple password management.
      </h2>
      <p className="text-secondary-foreground/70 text-lg">
        Manage your passwords and sensitive information securely and
        effortlessly.
      </p>

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
                    disabled={isLoading}
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
            disabled={isLoading}
            size="lg"
          >
            {isLoading && <Icons.spinner className="size-4 animate-spin" />}{" "}
            Join Waitlist
          </Button>
        </form>
      </Form>
    </div>
  )
}
