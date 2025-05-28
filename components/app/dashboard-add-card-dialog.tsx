"use client"

import { useState } from "react"
import { CardDto, CardDtoSchema } from "@/schemas/card"
import { TagDto } from "@/schemas/tag"
import { zodResolver } from "@hookform/resolvers/zod"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddCardForm } from "@/components/app/dashboard-add-card-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Form } from "@/components/ui/form"

import { createCard } from "@/actions/card"

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

  const [createMore, setCreateMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(CardDtoSchema),
    defaultValues: {
      name: "",
      description: "",
      notes: "",
      type: CardType.CREDIT,
      provider: CardProvider.VISA,
      status: CardStatus.ACTIVE,
      number: "",
      cvv: "",
      encryptionKey: "",
      iv: "",
      billingAddress: "",
      cardholderName: "",
      cardholderEmail: "",
      tags: [],
    },
  })

  console.log(form.formState.errors)

  async function onSubmit() {
    try {
      setIsSubmitting(true)

      const cardData = form.getValues()

      console.log(cardData)

      // Validate form
      const isValid = await form.trigger()
      if (!isValid) {
        toast("Please fill in all required fields", "error")
        return
      }

      // Encrypt sensitive data
      const key = await generateEncryptionKey()
      const encryptCvvResult = await encryptData(cardData.cvv, key)
      const encryptNumberResult = await encryptData(cardData.number, key)
      const keyString = await exportKey(key)

      // Create the card DTO with encrypted data
      const cardDto: CardDto = {
        ...(cardData as CardDto),
        number: encryptNumberResult.encryptedData,
        cvv: encryptCvvResult.encryptedData,
        encryptionKey: keyString,
        iv: encryptCvvResult.iv, // Use the IV from one of the encryptions
      }

      const result = await createCard(cardDto)

      if (result.success) {
        toast("Card saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          form.reset({
            name: "",
            description: "",
            notes: "",
            type: CardType.CREDIT,
            provider: CardProvider.VISA,
            status: CardStatus.ACTIVE,
            number: "",
            cvv: "",
            encryptionKey: "",
            iv: "",
            billingAddress: "",
            cardholderName: "",
            cardholderEmail: "",
            tags: [],
          })
        }
      } else {
        const errorDetails = result.issues
          ? result.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")
          : result.error

        toast(
          `Failed to save card: ${errorDetails || "Unknown error"}`,
          "error"
        )
      }
    } catch (error) {
      const { message, details } = handleErrors(error, "Failed to save card")
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
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Card"
      description="Add a new card to your vault. All information is securely stored."
      isSubmitting={isSubmitting}
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
          <DashboardAddCardForm form={form} availableTags={availableTags} />
        </form>
      </Form>
    </AddItemDialog>
  )
}
