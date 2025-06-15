import { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { AuthRegisterForm } from "@/components/app/auth-register-form"
import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"

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
      <div className="from-muted to-muted-foreground/20 relative hidden overflow-hidden bg-gradient-to-br lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="from-primary/10 to-primary/20 absolute h-48 w-72 translate-x-8 translate-y-4 rotate-3 transform rounded-2xl bg-gradient-to-br shadow-lg"></div>
            <div className="from-primary/20 to-primary/30 absolute h-48 w-72 translate-x-4 translate-y-2 -rotate-2 transform rounded-2xl bg-gradient-to-br shadow-xl"></div>

            <div className="from-primary/30 to-primary/40 relative flex h-48 w-72 items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <div className="bg-primary absolute left-8 top-8 h-2 w-2 rounded-full"></div>
                <div className="bg-primary absolute right-8 top-8 h-2 w-2 rounded-full"></div>
                <div className="bg-primary absolute bottom-8 left-8 h-2 w-2 rounded-full"></div>
                <div className="bg-primary absolute bottom-8 right-8 h-2 w-2 rounded-full"></div>
                <div className="bg-primary absolute left-1/2 top-8 h-2 w-2 -translate-x-1/2 transform rounded-full"></div>

                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 288 192"
                >
                  <path
                    d="M32 32 L144 32 L256 32"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M32 32 L32 160"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M256 32 L256 160"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M32 160 L256 160"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M144 32 L144 160"
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              </div>

              <div className="bg-primary/20 relative z-10 flex h-16 w-16 items-center justify-center rounded-xl backdrop-blur-sm">
                <svg
                  className="text-primary h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V18H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
            </div>

            <div className="from-primary/40 to-primary/50 absolute -right-4 -top-4 h-6 w-6 rotate-12 transform rounded-lg bg-gradient-to-br shadow-lg"></div>
            <div className="from-primary/40 to-primary/50 absolute -bottom-6 -left-6 h-4 w-4 rounded-full bg-gradient-to-br shadow-md"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
