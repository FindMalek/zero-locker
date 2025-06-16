"use client"

import { orpc } from "@/orpc/client"
import { useQuery } from "@tanstack/react-query"

// Demo hooks to test oRPC setup
export function usePing() {
  return useQuery({
    queryKey: ["demo", "ping"],
    queryFn: () => orpc.demo.ping(),
  })
}

export function useHello(name: string) {
  return useQuery({
    queryKey: ["demo", "hello", name],
    queryFn: () => orpc.demo.hello({ name }),
    enabled: !!name,
  })
}
