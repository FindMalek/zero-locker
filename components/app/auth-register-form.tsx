"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useInitializeDefaultContainers } from "@/orpc/hooks/use-users"
import { signUpInputSchema, type SignUpInput } from "@/schemas/user/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { signUp } from "@/lib/auth/client"
import { cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"

export function AuthRegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const initializeContainers = useInitializeDefaultContainers()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpInputSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      image: "https://avatar.vercel.sh/default",
    },
  })

  async function onSubmit(data: SignUpInput) {
    try {
      setIsLoading(true)
      const { error } = await signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          image: `https://avatar.vercel.sh/${data.email}`,
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            setIsLoading(true)
          },
          onSuccess: async () => {
            try {
              await initializeContainers.mutateAsync()
            } catch {}
            router.push("/dashboard")
          },
          onError: (ctx) => {
            toast("Something went wrong. Please try again.", {
              variant: "destructive",
              description:
                ctx.error instanceof Error
                  ? ctx.error.message
                  : "Unknown error",
            })
          },
        }
      )

      if (error) {
        toast("Something went wrong. Please try again.", {
          variant: "destructive",
          description: error.message,
        })
      }
    } catch (error) {
      toast("Something went wrong. Please try again.", {
        variant: "destructive",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input variant="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : null}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  )
}
