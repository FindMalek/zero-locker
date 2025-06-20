import { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { AuthRegisterForm } from "@/components/app/auth-register-form"
import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"
import { GeneratedFlickerEffect } from "@/components/ui/flickering-grid"

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account",
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <Icons.logo className="text-sm grayscale-0" />
            {siteConfig.name}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md px-4">
            <h1 className="mb-4 text-xl font-bold">Create an account</h1>
            <div className="mb-4 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="hover:text-primary underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>

            <AuthRegisterForm />

            <div className="text-muted-foreground mt-4 text-balance text-xs">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <GeneratedFlickerEffect />
      </div>
    </div>
  )
}
