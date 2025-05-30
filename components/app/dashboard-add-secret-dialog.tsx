"use client"

import { useEffect, useState } from "react"
import { SecretDto } from "@/schemas/secret"
import { zodResolver } from "@hookform/resolvers/zod"
import { SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import { cn, getMetadataLabels, handleErrors } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { usePlatforms } from "@/hooks/use-platforms"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddSecretForm } from "@/components/app/dashboard-add-secret-form"
import { DashboardAddSecretMetadataForm } from "@/components/app/dashboard-add-secret-metadata-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import { createSecret } from "@/actions/secret"

interface SecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddSecretDialog({
  open,
  onOpenChange,
}: SecretDialogProps) {
  const { toast } = useToast()
  const { platforms, error: platformsError } = usePlatforms()

  const [createMore, setCreateMore] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [secretStrength, setSecretStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const form = useForm<SecretDto>({
    resolver: zodResolver(SecretDto),
    defaultValues: {
      name: "",
      value: "",
      description: "",
      type: SecretType.ENV_VARIABLE,
      status: SecretStatus.ACTIVE,
      expiresAt: undefined,
      platformId: "",
      containerId: "",
      encryptionKey: "",
      iv: "",
      userId: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (platformsError) {
      toast(platformsError, "error")
    }
  }, [platformsError, toast])

  const handleGenerateSecret = () => {
    const newSecret = generatePassword(32) // Longer for secrets
    form.setValue("value", newSecret)
    setSecretStrength(checkPasswordStrength(newSecret))
  }

  const handleSecretChange = (secret: string) => {
    setSecretStrength(checkPasswordStrength(secret))
  }

  const handleCopySecret = () => {
    copy(form.getValues("value"))
  }

  // Check if metadata form has any meaningful values
  const hasMetadataValues = () => {
    const values = form.getValues()
    return !!(
      values.expiresAt ||
      values.status !== SecretStatus.ACTIVE
    )
  }

  // Get labels for metadata fields that have values
  const getMetadataLabelsForSecret = () => {
    const values = form.getValues()
    const fieldMappings = {
      expiresAt: "Expires",
      ...(values.status !== SecretStatus.ACTIVE && { status: "Status" }),
    }
    return getMetadataLabels(values, fieldMappings)
  }

  async function onSubmit() {
    try {
      setIsSubmitting(true)

      // Validate form
      const isValid = await form.trigger()
      if (!isValid) {
        toast("Please fill in all required fields", "error")
        return
      }

      const secretData = form.getValues()

      // Encrypt secret value
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(secretData.value, key)
      const keyString = await exportKey(key)

      const secretDto: SecretDto = {
        name: secretData.name,
        value: encryptResult.encryptedData,
        description: secretData.description,
        type: secretData.type,
        status: secretData.status,
        expiresAt: secretData.expiresAt,
        encryptionKey: keyString,
        iv: encryptResult.iv,
        platformId: secretData.platformId,
        containerId: secretData.containerId,
        userId: secretData.userId,
      }

      const result = await createSecret(secretDto)

      if (result.success) {
        toast("Secret saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          form.reset({
            name: "",
            value: "",
            description: "",
            type: SecretType.ENV_VARIABLE,
            status: SecretStatus.ACTIVE,
            expiresAt: undefined,
            platformId: secretData.platformId,
            containerId: secretData.containerId,
            encryptionKey: "",
            iv: "",
            userId: "",
          })
          setSecretStrength(null)
          setShowMetadata(false)
        }
      } else {
        const errorDetails = result.issues
          ? result.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")
          : result.error

        toast(
          `Failed to save secret: ${errorDetails || "Unknown error"}`,
          "error"
        )
      }
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to save secret"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setCreateMore(false)
      setShowMetadata(false)
      setSecretStrength(null)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Secret"
      description="Add a new secret to your vault. All information is securely stored."
      isSubmitting={isSubmitting}
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another secret"
      submitText="Save Secret"
      formId="secret-form"
      className="sm:max-w-[800px]"
    >
      <Form {...form}>
        <form
          id="secret-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          <DashboardAddSecretForm
            form={form}
            platforms={platforms}
            secretStrength={secretStrength}
            onSecretChange={handleSecretChange}
            onGenerateSecret={handleGenerateSecret}
            onCopySecret={handleCopySecret}
            isCopied={isCopied}
          />

          <div className="space-y-4">
            <Separator />

            <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "hover:bg-muted/50 flex w-full items-center justify-between p-4",
                    showMetadata && "bg-muted/55"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Icons.add className="h-4 w-4" />
                      <span className="font-medium">
                        Additional Information
                      </span>
                    </div>
                    {hasMetadataValues() && (
                      <Badge variant="secondary" className="text-xs">
                        {getMetadataLabelsForSecret()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {showMetadata ? "Hide" : "Optional"}
                    </span>
                    <Icons.chevronDown
                      className={`h-4 w-4 transition-transform ${
                        showMetadata ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4">
                <div className="bg-muted/55 p-4">
                  <DashboardAddSecretMetadataForm form={form} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </form>
      </Form>
    </AddItemDialog>
  )
}
