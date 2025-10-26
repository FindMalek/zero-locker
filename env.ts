import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    NODE_ENV: z.enum(["development", "production"]),
    BETTER_AUTH_SECRET: z.string().min(32).max(64),
    LOGO_DEV_TOKEN: z.string().min(20).startsWith("sk_"),
    RESEND_API_KEY: z.string().min(20).startsWith("re_"),
    MARKETING_SUBSCRIPTION_EMAIL: z.string().email(),
    LEMON_SQUEEZY_API_KEY: z.string().min(20),
    LEMON_SQUEEZY_STORE_ID: z.string().min(1),
    LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().startsWith("http"),
    NEXT_PUBLIC_LOGO_DEV_TOKEN: z.string().min(20).startsWith("pk_"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    LOGO_DEV_TOKEN: process.env.LOGO_DEV_TOKEN,
    NEXT_PUBLIC_LOGO_DEV_TOKEN: process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MARKETING_SUBSCRIPTION_EMAIL: process.env.MARKETING_SUBSCRIPTION_EMAIL,
    LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY,
    LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
    LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  },
})
