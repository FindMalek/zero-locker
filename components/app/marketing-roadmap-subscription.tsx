"use client"

import { useState } from "react"
import { useSubscribeToRoadmap } from "@/orpc/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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

const subscriptionSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function MarketingRoadmapSubscription() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const subscribeToRoadmapMutation = useSubscribeToRoadmap()

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: "",
    },
  })

  const isLoading = subscribeToRoadmapMutation.isPending

  const handleSubmit = async (data: SubscriptionFormData) => {
    try {
      setStatus("idle")

      subscribeToRoadmapMutation.mutate(data, {
        onSuccess: (result) => {
          if (result.success) {
            setStatus("success")
            form.reset()
            toast.success("Successfully subscribed!", {
              description: "You'll receive updates about our roadmap.",
            })

            setTimeout(() => {
              setStatus("idle")
            }, 3000)
          } else {
            setStatus("error")
            const errorMessage =
              result.error || "Something went wrong. Please try again."
            form.setError("root", {
              message: errorMessage,
            })
            toast.error("Subscription failed", {
              description: errorMessage,
            })
          }
        },
        onError: (error) => {
          setStatus("error")
          const { message, description } = handleORPCError(error)

          form.setError("root", {
            message,
          })

          toast.error("Subscription failed", {
            description,
          })
        },
      })
    } catch (error) {
      setStatus("error")
      const { message, description } = handleORPCError(error)

      form.setError("root", {
        message,
      })

      toast.error("Subscription failed", {
        description,
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-muted-foreground font-mono text-sm">
        subscribe for updates
      </h3>
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
                    className="border-border bg-accent text-foreground placeholder:text-muted-foreground focus-visible:ring-ring font-mono text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm disabled:opacity-50"
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
        <p className="text-destructive font-mono text-xs">
          something went wrong
        </p>
      )}
    </div>
  )
}
