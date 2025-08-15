import {
  Feature,
  getUpgradeMessage,
  useUserPermissions,
} from "@/lib/permissions"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface UpgradePromptProps {
  feature: Feature
  customDescription?: string
  className?: string
}

/**
 * Reusable upgrade prompt component that only shows for Normal users
 * Uses centralized permission system and upgrade messages
 */
export function UpgradePrompt({
  feature,
  customDescription,
  className,
}: UpgradePromptProps) {
  const permissions = useUserPermissions()

  // Only show for users who should see upgrade prompts
  if (!permissions.shouldShowUpgradePrompts) {
    return null
  }

  const upgradeMessage = getUpgradeMessage(feature)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{upgradeMessage.title}</CardTitle>
        <CardDescription>
          {customDescription || upgradeMessage.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Upgrade to Pro</Button>
      </CardContent>
    </Card>
  )
}
