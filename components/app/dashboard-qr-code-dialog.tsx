"use client"

import { useState } from "react"
import { qrCodeFormInputSchema, type QrCodeFormInput } from "@/schemas/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"


interface QrCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentialId: string
}

export function DashboardQrCodeDialog({
  open,
  onOpenChange,
  credentialId,
}: QrCodeDialogProps) {
  const [qrCodeColor, setQrCodeColor] = useState("#DF6547")
  const [showLogo, setShowLogo] = useState(true)

  const form = useForm<QrCodeFormInput>({
    resolver: zodResolver(qrCodeFormInputSchema),
    defaultValues: {
      url: `https://zero-locker.app/credential/${credentialId}`,
      requirePassword: false,
      password: "",
    },
  })

  const requirePassword = form.watch("requirePassword")

  const handleDownload = () => {
    // TODO: Implement QR code download
    console.log("Download QR code")
  }

  const handleCopyImage = () => {
    // TODO: Implement QR code copy
    console.log("Copy QR code image")
  }

  const handleSaveChanges = (data: QrCodeFormInput) => {
    // TODO: Implement QR code generation with settings
    console.log("Save QR code settings:", data)
    onOpenChange(false)
  }

  const colorSwatches = [
    "#000000", // Black
    "#EF4444", // Red
    "#DF6547", // Reddish-orange
    "#EC4899", // Pink
    "#F59E0B", // Yellow
    "#10B981", // Green
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              QR Code
              <Badge variant="secondary" className="text-xs">
                PRO
              </Badge>
            </DialogTitle>
            <Icons.search className="text-muted-foreground size-4" />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Preview Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">QR Code Preview</Label>
                <Icons.helpCircle className="text-muted-foreground size-3" />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="size-8 p-0"
                >
                  <Icons.chevronDown className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyImage}
                  className="size-8 p-0"
                >
                  <Icons.copy className="size-4" />
                </Button>
              </div>
            </div>

            {/* QR Code Preview Area */}
            <div className="bg-muted/20 border-border flex aspect-square items-center justify-center rounded-lg border-2 border-dashed">
              <div className="relative">
                {/* Mock QR Code */}
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`size-3 rounded-sm ${
                        Math.random() > 0.5 ? "bg-current" : "bg-transparent"
                      }`}
                      style={{ color: qrCodeColor }}
                    />
                  ))}
                </div>

                {/* Center Logo */}
                {showLogo && (
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black p-1">
                    <div className="flex size-6 items-center justify-center rounded-full bg-white">
                      <span className="text-xs font-bold text-black">d</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              URL
            </Label>
            <Input
              id="url"
              {...form.register("url")}
              placeholder="Enter URL to encode"
              className="w-full"
            />
          </div>

          {/* Logo Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Logo</Label>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </div>
            <Switch checked={showLogo} onCheckedChange={setShowLogo} />
          </div>

          {/* QR Code Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">QR Code Color</Label>
            <div className="space-y-2">
              <Input
                value={qrCodeColor}
                onChange={(e) => setQrCodeColor(e.target.value)}
                className="w-full"
                placeholder="#DF6547"
              />
              <div className="flex gap-2">
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    onClick={() => setQrCodeColor(color)}
                    className={`size-6 rounded-full border-2 transition-all ${
                      qrCodeColor === color
                        ? "border-primary ring-primary/20 ring-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {qrCodeColor === color && (
                      <div className="flex size-full items-center justify-center">
                        <Icons.check className="size-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Password Protection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Require Password</Label>
              <Switch
                {...form.register("requirePassword")}
                checked={requirePassword}
                onCheckedChange={(checked) => {
                  form.setValue("requirePassword", checked)
                  if (!checked) {
                    form.setValue("password", "")
                  }
                }}
              />
            </div>

            {requirePassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Enter password"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSaveChanges)}
            className="bg-black text-white hover:bg-black/90"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
