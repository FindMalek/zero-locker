"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"
import type {
  CredentialOutput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"
import type { AccountStatus } from "@prisma/client"
import { credentialFormDtoSchema, type CredentialFormDto } from "@/schemas/credential/credential"

import { DashboardCredentialDetailSkeleton } from "@/components/app/dashboard-credential-detail-skeleton"
import { CredentialForm } from "@/components/app/dashboard-credential-form"
import { CredentialHeader } from "@/components/app/dashboard-credential-header"
import { CredentialFooter } from "@/components/app/dashboard-credential-footer"
import { CredentialSidebar } from "@/components/app/dashboard-credential-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { FloatingSaveToolbar } from "@/components/shared/floating-save-toolbar"
import { Icons } from "@/components/shared/icons"

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

  const {
    data: credential,
    isLoading,
    error,
  } = useCredential(credentialId, {
    initialData: initialData?.credential,
  })
  const updateCredentialMutation = useUpdateCredential()

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

  const { formState: { isDirty }, reset, handleSubmit } = form

  // Initialize form when credential loads
  useEffect(() => {
    if (credential) {
      const initialFormData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        // TODO: Get these from credential metadata when available
        passwordProtection: true,
        twoFactorAuth: false,
        accessLogging: true,
      }
      reset(initialFormData)
    }
  }, [credential, reset])

  const handleSave = async (data: CredentialFormDto) => {
    if (!credential) return

    try {
      const updateData: UpdateCredentialInput = {
        id: credential.id,
        identifier: data.identifier,
        description: data.description || undefined,
        status: data.status,
        platformId: data.platformId,
        containerId: data.containerId || undefined,
        // TODO: Handle metadata fields (passwordProtection, twoFactorAuth, accessLogging)
      }

      await updateCredentialMutation.mutateAsync(updateData)
      
      // Reset form dirty state after successful save
      reset(data)
    } catch (error) {
      console.error("Failed to save credential:", error)
    }
  }

  const handleDiscard = () => {
    if (credential) {
      const originalData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        passwordProtection: true,
        twoFactorAuth: false,
        accessLogging: true,
      }
      reset(originalData)
    }
  }

  const handleDelete = async () => {
    if (!credential) return

    // TODO: Implement delete logic
    console.log("Deleting credential:", credential.id)
    router.push("/dashboard/credentials")
  }

  const handleStatusChange = (status: AccountStatus) => {
    form.setValue("status", status, { shouldDirty: true })
  }

  const handleContainerChange = (containerId: string) => {
    form.setValue("containerId", containerId, { shouldDirty: true })
  }

  if (isLoading) {
    return <DashboardCredentialDetailSkeleton />
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <EmptyState
          icon={() => <Icons.warning className="h-12 w-12" />}
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
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-3">
            {/* Header */}
            <CredentialHeader credential={credential} onDelete={handleDelete} />

            {/* Form Fields */}
            <CredentialForm
              credential={credential}
              form={form}
            />

            {/* Footer */}
            <CredentialFooter credential={credential} />
          </div>

          {/* Right Sidebar */}
          <CredentialSidebar
            credential={credential}
            onStatusChange={handleStatusChange}
            onContainerChange={handleContainerChange}
          />
        </div>
      </div>

      {/* Floating Save Toolbar */}
      <FloatingSaveToolbar
        isVisible={isDirty}
        onSave={handleSubmit(handleSave)}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
