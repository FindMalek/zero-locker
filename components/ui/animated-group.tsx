"use client"

import { motion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

interface AnimatedGroupProps {
  children: React.ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
}

export function AnimatedGroup({
  children,
  className,
  variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
        },
      },
    },
  },
}: AnimatedGroupProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={variants.container}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={variants.item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={variants.item}>{children}</motion.div>
      )}
    </motion.div>
  )
} 