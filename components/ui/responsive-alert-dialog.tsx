"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface ResponsiveAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface ResponsiveAlertDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveAlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveAlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveAlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveAlertDialogCloseProps {
  className?: string
  children?: React.ReactNode
  asChild?: boolean
  disabled?: boolean
}

interface ResponsiveAlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

const ResponsiveAlertDialogContext = React.createContext<{
  isMobile: boolean
}>({
  isMobile: false,
})

function ResponsiveAlertDialog({ open, onOpenChange, children }: ResponsiveAlertDialogProps) {
  const isMobile = useIsMobile()

  const contextValue = React.useMemo(
    () => ({
      isMobile,
    }),
    [isMobile]
  )

  if (isMobile) {
    return (
      <ResponsiveAlertDialogContext.Provider value={contextValue}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ResponsiveAlertDialogContext.Provider>
    )
  }

  return (
    <ResponsiveAlertDialogContext.Provider value={contextValue}>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {children}
      </AlertDialog>
    </ResponsiveAlertDialogContext.Provider>
  )
}

function ResponsiveAlertDialogContent({ className, children }: ResponsiveAlertDialogContentProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh] flex flex-col px-4", className)}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <AlertDialogContent className={cn("sm:max-w-lg", className)}>
      {children}
    </AlertDialogContent>
  )
}

function ResponsiveAlertDialogHeader({ className, children }: ResponsiveAlertDialogHeaderProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerHeader className={cn("text-left pb-4", className)}>
        {children}
      </DrawerHeader>
    )
  }

  return (
    <AlertDialogHeader className={className}>
      {children}
    </AlertDialogHeader>
  )
}

function ResponsiveAlertDialogTitle({ className, children }: ResponsiveAlertDialogTitleProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerTitle className={cn("text-lg font-semibold", className)}>
        {children}
      </DrawerTitle>
    )
  }

  return (
    <AlertDialogTitle className={className}>
      {children}
    </AlertDialogTitle>
  )
}

function ResponsiveAlertDialogDescription({ className, children }: ResponsiveAlertDialogDescriptionProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerDescription className={cn("text-sm text-muted-foreground", className)}>
        {children}
      </DrawerDescription>
    )
  }

  return (
    <AlertDialogDescription className={className}>
      {children}
    </AlertDialogDescription>
  )
}

function ResponsiveAlertDialogFooter({ className, children }: ResponsiveAlertDialogFooterProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerFooter className={cn("px-4 pb-4 pt-2 border-t", className)}>
        {children}
      </DrawerFooter>
    )
  }

  return (
    <AlertDialogFooter className={className}>
      {children}
    </AlertDialogFooter>
  )
}

function ResponsiveAlertDialogCancel({ className, children, asChild, disabled }: ResponsiveAlertDialogCloseProps) {
  const { isMobile } = React.useContext(ResponsiveAlertDialogContext)

  if (isMobile) {
    return (
      <DrawerClose className={className} asChild={asChild} disabled={disabled}>
        {children}
      </DrawerClose>
    )
  }

  return (
    <AlertDialogCancel className={className} asChild={asChild} disabled={disabled}>
      {children}
    </AlertDialogCancel>
  )
}

export {
  ResponsiveAlertDialog,
  ResponsiveAlertDialogContent,
  ResponsiveAlertDialogHeader,
  ResponsiveAlertDialogTitle,
  ResponsiveAlertDialogDescription,
  ResponsiveAlertDialogCancel,
  ResponsiveAlertDialogFooter,
}
