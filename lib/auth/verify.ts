"use server"

import { headers as nextHeaders } from "next/headers"

import { auth } from "./server"

export async function verifySession() {
  const session = await auth.api.getSession({
    headers: await nextHeaders(),
  })

  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  return session
}
