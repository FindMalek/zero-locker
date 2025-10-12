"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

const subscriptionSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function MarketingRoadmapSubscription() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: "",
    },
  })

  const isLoading = form.formState.isSubmitting

  const handleSubmit = async (data: SubscriptionFormData) => {
    try {
      setStatus("idle")

      // Simulate API call - replace with your actual subscription logic
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("success")
      form.reset()

      setTimeout(() => {
        setStatus("idle")
      }, 3000)
    } catch (error) {
      setStatus("error")
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-sm text-gray-400">subscribe for updates</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="border-gray-800 bg-[#1a1a1a] font-mono text-sm text-white placeholder:text-gray-600 focus-visible:ring-gray-700"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-white font-mono text-sm text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {isLoading ? "subscribing..." : "subscribe"}
          </Button>
        </form>
      </Form>
      {status === "success" && (
        <p className="font-mono text-xs text-emerald-500">
          subscribed successfully
        </p>
      )}
      {status === "error" && (
        <p className="font-mono text-xs text-red-500">something went wrong</p>
      )}
    </div>
  )
}
