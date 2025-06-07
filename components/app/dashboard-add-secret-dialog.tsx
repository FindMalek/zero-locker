"use client"

import { useEffect, useState } from "react"
import { SecretDto } from "@/schemas/secrets/secrets"
import { zodResolver } from "@hookform/resolvers/zod"
import { SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors } from "@/lib/utils"
import { usePlatforms } from "@/hooks/use-platforms"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddSecretForm } from "@/components/app/dashboard-add-secret-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Form } from "@/components/ui/form"

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

  const [title, setTitle] = useState("")
  const [createMore, setCreateMore] = useState(false)

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

      // Use title as description if no description provided
      if (title && !secretData.description) {
        secretData.description = title
      }

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
          setTitle("")
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
      const { message, details } = handleErrors(error, "Failed to save secret")
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
      setTitle("")
      setCreateMore(false)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Secret"
      description="Add a new secret to your vault. All information is securely stored."
      icon={<Icons.key className="size-5" />}
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
            title={title}
            onTitleChange={setTitle}
          />
        </form>
      </Form>
    </AddItemDialog>
  )
}
