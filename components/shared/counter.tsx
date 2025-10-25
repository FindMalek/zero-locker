"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface CounterProps {
  initialValue?: number
  step?: number
}

export function Counter({ initialValue = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(initialValue)

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-card">
      <div className="text-2xl font-bold">{count}</div>
      <div className="flex gap-2">
        <Button onClick={decrement} variant="outline" size="sm">
          -
        </Button>
        <Button onClick={increment} variant="outline" size="sm">
          +
        </Button>
        <Button onClick={reset} variant="secondary" size="sm">
          Reset
        </Button>
      </div>
    </div>
  )
}
