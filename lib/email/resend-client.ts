import { Resend } from "resend"

import { env } from "@/env"

export const resendClient = new Resend(env.RESEND_API_KEY)
