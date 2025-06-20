"use client"

import { useState } from "react"
import { useCreateContainerWithSecrets } from "@/orpc/hooks"
import { SecretDto, secretDtoSchema } from "@/schemas/secrets/secret"
import { zodResolver } from "@hookform/resolvers/zod"
import { ContainerType, SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors, parseKeyValuePairs } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddSecretForm } from "@/components/app/dashboard-add-secret-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Form } from "@/components/ui/form"

interface SecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Displays a dialog for securely adding new secrets to a vault, handling client-side encryption and form validation.
 *
 * Presents a form for entering secret data, encrypts each secret on the client before submission, and supports creating multiple secrets in sequence. On successful creation, shows a confirmation and resets the form if desired; on failure, displays an error message.
 *
 * @param open - Whether the dialog is visible
 * @param onOpenChange - Callback to update the dialog's open state
 */
export function DashboardAddSecretDialog({
  open,
  onOpenChange,
}: SecretDialogProps) {
  const { toast } = useToast()
  const createContainerWithSecretsMutation = useCreateContainerWithSecrets()

  const [title, setTitle] = useState("")
  const [createMore, setCreateMore] = useState(false)
  const [sensitiveData, setSensitiveData] = useState({
    value: "",
  })

  const form = useForm<SecretDto>({
    resolver: zodResolver(secretDtoSchema),
    defaultValues: {
      name: "",
      note: "",
      valueEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
      metadata: [
        {
          type: SecretType.API_KEY,
          status: SecretStatus.ACTIVE,
          otherInfo: [],
          secretId: "",
        },
      ],
      containerId: "",
    },
  })

  async function onSubmit() {
    if (!sensitiveData.value.trim()) {
      toast("Secret value is required", "error")
      return
    }

    const keyValuePairs = parseKeyValuePairs(sensitiveData.value)

    if (keyValuePairs.length === 0) {
      toast("No valid key-value pairs found", "error")
      return
    }

    try {
      // Encrypt all secrets on the client side
      const encryptedSecrets = await Promise.all(
        keyValuePairs.map(async (pair: { key: string; value: string }) => {
          const key = await generateEncryptionKey()
          const encryptResult = await encryptData(pair.value, key)
          const keyString = await exportKey(key as CryptoKey)

          return {
            name: pair.key,
            note: "",
            valueEncryption: {
              encryptedValue: encryptResult.encryptedData,
              iv: encryptResult.iv,
              encryptionKey: keyString,
            },
          }
        })
      )

      createContainerWithSecretsMutation.mutate(
        {
          container: {
            name: title,
            icon: "🔧",
            description: form.getValues("note"),
            type: ContainerType.SECRETS_ONLY,
            tags: [],
          },
          secrets: encryptedSecrets,
        },
        {
          onSuccess: (result) => {
            if (result.success) {
              toast(
                `Successfully created ${result.secrets?.length || 0} secrets`,
                "success"
              )

              if (!createMore) {
                handleDialogOpenChange(false)
              } else {
                form.reset({
                  name: "",
                  note: "",
                  valueEncryption: {
                    encryptedValue: "",
                    iv: "",
                    encryptionKey: "",
                  },
                  metadata: [
                    {
                      type: SecretType.API_KEY,
                      status: SecretStatus.ACTIVE,
                      otherInfo: [],
                      secretId: "",
                    },
                  ],
                  containerId: "",
                })
                setSensitiveData({ value: "" })
                setTitle("")
              }
            } else {
              toast(
                `Failed to create secrets: ${result.error || "Unknown error"}`,
                "error"
              )
            }
          },
          onError: (error) => {
            console.error("Error in onSubmit:", error)
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
          },
        }
      )
    } catch (error) {
      console.error("Error in encryption:", error)
      const { message, details } = handleErrors(
        error,
        "Failed to encrypt secret"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setSensitiveData({ value: "" })
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
      isSubmitting={createContainerWithSecretsMutation.isPending}
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
            title={title}
            onTitleChange={setTitle}
            sensitiveData={sensitiveData}
            setSensitiveData={setSensitiveData}
          />
        </form>
      </Form>
    </AddItemDialog>
  )
}
