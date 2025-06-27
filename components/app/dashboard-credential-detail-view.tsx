"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  useCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type {
  CredentialOutput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"
import type { AccountStatus } from "@prisma/client"

import { DashboardCredentialDetailSkeleton } from "@/components/app/dashboard-credential-detail-skeleton"
import { CredentialForm } from "@/components/app/dashboard-credential-form"
import {
  CredentialFooter,
  CredentialHeader,
} from "@/components/app/dashboard-credential-header"
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

interface CredentialFormData {
  identifier: string
  description: string | null
  passwordProtection: boolean
  twoFactorAuth: boolean
  accessLogging: boolean
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
  const { data: platforms } = usePlatforms(
    { page: 1, limit: 100 },
    {
      initialData: initialData?.platforms,
    }
  )
  const updateCredentialMutation = useUpdateCredential()

  // Form state management
  const [formData, setFormData] = useState<CredentialFormData>({
    identifier: "",
    description: null,
    passwordProtection: true,
    twoFactorAuth: false,
    accessLogging: true,
  })

  const [originalFormData, setOriginalFormData] = useState<CredentialFormData>({
    identifier: "",
    description: null,
    passwordProtection: true,
    twoFactorAuth: false,
    accessLogging: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data when credential loads
  useEffect(() => {
    if (credential) {
      const initialData = {
        identifier: credential.identifier,
        description: credential.description,
        passwordProtection: true, // TODO: Get from credential metadata
        twoFactorAuth: false, // TODO: Get from credential metadata
        accessLogging: true, // TODO: Get from credential metadata
      }
      setFormData(initialData)
      setOriginalFormData(initialData)
    }
  }, [credential])

  // Check for changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalFormData)
    setHasChanges(hasChanges)
  }, [formData, originalFormData])

  const handleSave = async () => {
    if (!credential) return

    try {
      const updateData: UpdateCredentialInput = {
        id: credential.id,
        identifier: formData.identifier,
        description: formData.description || undefined,
        // TODO: Map security settings to proper DTO fields
      }

      await updateCredentialMutation.mutateAsync(updateData)

      setOriginalFormData(formData)
      setHasChanges(false)
    } catch (error) {
      console.error("Failed to save credential:", error)
    }
  }

  const handleDiscard = () => {
    setFormData(originalFormData)
    setHasChanges(false)
  }

  const handleDelete = async () => {
    if (!credential) return

    // TODO: Implement delete logic
    console.log("Deleting credential:", credential.id)
    router.push("/dashboard/credentials")
  }

  const handleStatusChange = (status: AccountStatus) => {
    // TODO: Implement status change
    console.log("Changing status to:", status)
  }

  const handleContainerChange = (containerId: string) => {
    // TODO: Implement container change
    console.log("Changing container to:", containerId)
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
              data={formData}
              onChange={setFormData}
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
        isVisible={hasChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
