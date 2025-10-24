import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1).url(),
    NODE_ENV: z.enum(["development", "production"]),
    BETTER_AUTH_SECRET: z.string().min(10),
    LOGO_DEV_TOKEN: z.string().min(10),
    RESEND_API_KEY: z.string().min(10),
    MARKETING_SUBSCRIPTION_EMAIL: z.string().email(),
    LEMON_SQUEEZY_API_KEY: z.string().min(10),
    LEMON_SQUEEZY_STORE_ID: z.string().min(10),
    LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(10),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_LOGO_DEV_TOKEN: z.string().min(10),
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
