"use client"

import { useState } from "react"
import { useCreateCard } from "@/orpc/hooks"
import { CardDto, cardDtoSchema } from "@/schemas/card"
import { TagDto } from "@/schemas/utils/tag"
import { zodResolver } from "@hookform/resolvers/zod"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddCardForm } from "@/components/app/dashboard-add-card-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Form } from "@/components/ui/form"

interface CardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableTags?: TagDto[]
}

export function DashboardAddCardDialog({
  open,
  onOpenChange,
  availableTags = [],
}: CardDialogProps) {
  const { toast } = useToast()
  const createCardMutation = useCreateCard()
  const queryClient = useQueryClient()

  const [createMore, setCreateMore] = useState(false)
  const [sensitiveData, setSensitiveData] = useState({
    number: "",
    cvv: "",
  })

  const form = useForm({
    resolver: zodResolver(cardDtoSchema),
    defaultValues: {
      name: "",
      description: "",
      type: CardType.CREDIT,
      provider: CardProvider.VISA,
      status: CardStatus.ACTIVE,
      expiryDate: "",
      billingAddress: "",
      cardholderName: "",
      cardholderEmail: "",
      tags: [],
      numberEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
      cvvEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
    },
  })

  async function onSubmit() {
    if (!sensitiveData.number.trim()) {
      toast("Card number is required", "error")
      return
    }

    if (!sensitiveData.cvv.trim()) {
      toast("CVV is required", "error")
      return
    }

    try {
      const key = await generateEncryptionKey()
      const encryptCvvResult = await encryptData(sensitiveData.cvv, key)
      const encryptNumberResult = await encryptData(sensitiveData.number, key)
      const keyString = await exportKey(key as CryptoKey)

      form.setValue("numberEncryption", {
        encryptedValue: encryptNumberResult.encryptedData,
        iv: encryptNumberResult.iv,
        encryptionKey: keyString,
      })
      form.setValue("cvvEncryption", {
        encryptedValue: encryptCvvResult.encryptedData,
        iv: encryptCvvResult.iv,
        encryptionKey: keyString,
      })

      const isValid = await form.trigger()
      if (!isValid) {
        toast("Please fill in all required fields", "error")
        return
      }

      const cardData = form.getValues()

      const cardDataWithEncryption: CardDto = {
        ...cardData,
        numberEncryption: {
          encryptedValue: encryptNumberResult.encryptedData,
          iv: encryptNumberResult.iv,
          encryptionKey: keyString,
        },
        cvvEncryption: {
          encryptedValue: encryptCvvResult.encryptedData,
          iv: encryptCvvResult.iv,
          encryptionKey: keyString,
        },
      }

      createCardMutation.mutate(cardDataWithEncryption, {
        onSuccess: () => {
          toast("Card saved successfully", "success")

          if (!createMore) {
            handleDialogOpenChange(false)
          } else {
            form.reset({
              name: "",
              description: "",
              type: CardType.CREDIT,
              provider: CardProvider.VISA,
              status: CardStatus.ACTIVE,
              expiryDate: "",
              billingAddress: "",
              cardholderName: "",
              cardholderEmail: "",
              tags: [],
              numberEncryption: {
                encryptedValue: "",
                iv: "",
                encryptionKey: "",
              },
              cvvEncryption: {
                encryptedValue: "",
                iv: "",
                encryptionKey: "",
              },
            })
            setSensitiveData({ number: "", cvv: "" })
            queryClient.invalidateQueries({ queryKey: ["cards"] })
          }
        },
        onError: (error) => {
          const { message, details } = handleErrors(
            error,
            "Failed to save card"
          )
          toast(
            details
              ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
              : message,
            "error"
          )
        },
      })
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to encrypt card data"
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
      setSensitiveData({ number: "", cvv: "" })
      setCreateMore(false)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Card"
      description="Add a new card to your vault. All information is securely stored."
      icon={<Icons.creditCard className="size-5" />}
      isSubmitting={createCardMutation.isPending}
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another card"
      submitText="Save Card"
      formId="card-form"
      className="sm:max-w-[800px]"
    >
      <Form {...form}>
        <form
          id="card-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          <DashboardAddCardForm
            form={form}
            availableTags={availableTags}
            setSensitiveData={setSensitiveData}
          />
        </form>
      </Form>
    </AddItemDialog>
  )
}
