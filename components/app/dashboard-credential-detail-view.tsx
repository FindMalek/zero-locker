"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  useCredential,
  useCredentialSecuritySettings,
  useDeleteCredential,
  useUpdateCredential,
  useUpdateCredentialWithSecuritySettings,
} from "@/orpc/hooks/use-credentials"
import {
  credentialFormDtoSchema,
  type CredentialFormDto,
} from "@/schemas/credential/credential"
import type {
  CredentialOutput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardCredentialDetailSkeleton } from "@/components/app/dashboard-credential-detail-skeleton"
import { CredentialFooter } from "@/components/app/dashboard-credential-footer"
import { CredentialForm } from "@/components/app/dashboard-credential-form"
import { CredentialHeader } from "@/components/app/dashboard-credential-header"
import { CredentialKeyValuePairs } from "@/components/app/dashboard-credential-key-value-pairs"
import { CredentialSidebar } from "@/components/app/dashboard-credential-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { FloatingSaveToolbar } from "@/components/shared/floating-save-toolbar"
import { Icons } from "@/components/shared/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

interface CredentialDetailViewProps {
  credentialId: string
  initialData?: {
    credential: CredentialOutput
    platforms: ListPlatformsOutput
  }
}

export function CredentialDetailView({
  credentialId,
  initialData,
}: CredentialDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    data: credential,
    isLoading,
    error,
  } = useCredential(credentialId, {
    initialData: initialData?.credential,
  })
  const updateCredentialMutation = useUpdateCredentialWithSecuritySettings()
  const updateCredentialBasicMutation = useUpdateCredential() // For status-only updates
  const deleteCredentialMutation = useDeleteCredential()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [hasKeyValueChanges, setHasKeyValueChanges] = useState(false)

  const { data: securitySettings, isLoading: isLoadingSecuritySettings } =
    useCredentialSecuritySettings(credentialId)

  const platform = initialData?.platforms.platforms.find(
    (p) => p.id === credential?.platformId
  )
  if (!platform) {
    throw new Error("Platform not found")
  }

  // Form setup with react-hook-form and zod
  const form = useForm<CredentialFormDto>({
    resolver: zodResolver(credentialFormDtoSchema),
    defaultValues: {
      identifier: "",
      description: "",
      status: "ACTIVE",
      platformId: "",
      containerId: "",
      passwordProtection: true,
      twoFactorAuth: false,
      accessLogging: true,
    },
  })

  const {
    formState: { isDirty },
    reset,
    handleSubmit,
  } = form

  // Combined dirty state for floating toolbar
  const hasChanges = isDirty || hasKeyValueChanges

  // Initialize form when credential and security settings load
  useEffect(() => {
    if (credential && securitySettings) {
      const initialFormData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        passwordProtection: securitySettings.passwordProtection,
        twoFactorAuth: securitySettings.twoFactorAuth,
        accessLogging: securitySettings.accessLogging,
      }
      reset(initialFormData)
    }
  }, [credential, securitySettings, reset])

  const handleSave = async (data: CredentialFormDto) => {
    if (!credential) return

    try {
      // Use the security settings update endpoint that handles all fields including metadata
      const updateData = {
        id: credential.id,
        identifier: data.identifier,
        description: data.description,
        status: data.status,
        platformId: data.platformId,
        containerId: data.containerId,
        passwordProtection: data.passwordProtection,
        twoFactorAuth: data.twoFactorAuth,
        accessLogging: data.accessLogging,
      }

      await updateCredentialMutation.mutateAsync(updateData)

      // Reset form dirty state after successful save
      reset(data)
      toast("Credential updated successfully", "success")
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to save credential"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleDiscard = () => {
    if (credential && securitySettings) {
      const originalData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        passwordProtection: securitySettings.passwordProtection,
        twoFactorAuth: securitySettings.twoFactorAuth,
        accessLogging: securitySettings.accessLogging,
      }
      reset(originalData)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!credential) return

    try {
      await deleteCredentialMutation.mutateAsync({ id: credential.id })
      toast("Credential deleted successfully", "success")
      router.push("/dashboard/accounts")
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to delete credential"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const handleContainerChange = (containerId: string) => {
    form.setValue("containerId", containerId, { shouldDirty: true })
  }

  const handleStatusChange = async (status: AccountStatus) => {
    if (!credential) return

    try {
      const updateData: UpdateCredentialInput = {
        id: credential.id,
        status: status,
      }

      await updateCredentialBasicMutation.mutateAsync(updateData)
      toast("Status updated successfully", "success")
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update status"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  if (isLoading || isLoadingSecuritySettings) {
    return <DashboardCredentialDetailSkeleton />
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <EmptyState
          icon={() => <Icons.warning className="size-12" />}
          title="Credential not found"
          description="The credential you're looking for doesn't exist or you don't have access to it."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <CredentialHeader
              credential={credential}
              platform={platform}
              onDelete={handleDelete}
            />
            <Separator />
            <CredentialForm credential={credential} form={form} />
            <Separator />
            <CredentialKeyValuePairs
              credentialId={credential.id}
              onFormChange={setHasKeyValueChanges}
            />
            <CredentialFooter credential={credential} />
          </div>

          <CredentialSidebar
            credential={{
              ...credential,
              containerId: form.watch("containerId") || credential.containerId,
            }}
            onStatusChange={handleStatusChange}
            onContainerChange={handleContainerChange}
          />
        </div>
      </div>

      <FloatingSaveToolbar
        isVisible={hasChanges}
        onSave={() => {
          if (isDirty) {
            handleSubmit(handleSave)()
          }
          // Key-value pairs save is handled by their own component via window object
          if (hasKeyValueChanges && typeof window !== "undefined") {
            // @ts-expect-error - credentialKeyValuePairs is dynamically added to window object
            window.credentialKeyValuePairs?.save()
          }
        }}
        onDiscard={() => {
          if (isDirty) {
            handleDiscard()
          }
          // Key-value pairs discard is handled by their own component via window object
          if (hasKeyValueChanges && typeof window !== "undefined") {
            // @ts-expect-error - credentialKeyValuePairs is dynamically added to window object
            window.credentialKeyValuePairs?.cancel()
          }
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the credential for{" "}
              <strong>{credential?.identifier}</strong> on{" "}
              <strong>{platform.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteCredentialMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCredentialMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
