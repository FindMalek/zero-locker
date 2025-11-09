"use client"

import { useCurrentUser } from "@/orpc/hooks/use-users"
import type { UserSimpleOutput } from "@/schemas/user/user"

import { AccountNameField } from "@/components/app/account-name-field"
import { AccountPageHeader } from "@/components/app/account-page-header"
import { AccountPasswordField } from "@/components/app/account-password-field"
import { AccountField } from "@/components/shared/account-field"

interface AccountGeneralClientProps {
  initialUser: UserSimpleOutput
}

export function AccountGeneralClient({
  initialUser,
}: AccountGeneralClientProps) {
  const { data: user } = useCurrentUser()
  const currentUser = user ?? initialUser

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="General Settings"
        description="Manage your account settings and personal information"
      />

        <div className="space-y-6">
          <AccountField label="Email address" value={currentUser.email} />
          <AccountNameField initialName={currentUser.name} />
          <AccountPasswordField />
      </div>
    </div>
  )
}
