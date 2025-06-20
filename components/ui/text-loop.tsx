"use client"

import { useState, useEffect } from "react"
import { motion, type Transition, type Variants } from "motion/react"

interface TextLoopProps {
  children: React.ReactNode[]
  interval?: number
  transition?: Transition
  variants?: Variants
  className?: string
}

export function TextLoop({
  children,
  interval = 2000,
  transition = {
    type: "spring",
    stiffness: 900,
    damping: 95,
    mass: 5,
  },
  variants = {
    initial: {
      y: 5,
      rotateX: 90,
      opacity: 0,
      filter: "blur(10px)",
    },
    animate: {
      y: 0,
      rotateX: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: {
      y: -5,
      rotateX: -90,
      opacity: 0,
      filter: "blur(10px)",
    },
  },
  className,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (children.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length)
    }, interval)

    return () => clearInterval(timer)
  }, [children.length, interval])

  if (children.length === 0) return null

  return (
    <motion.span
      key={currentIndex}
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children[currentIndex]}
    </motion.span>
  )
} 