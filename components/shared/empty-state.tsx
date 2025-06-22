import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/shared/icons"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = Icons.grid,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mb-4 text-muted-foreground">
          <Icon className="mx-auto h-12 w-12" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-muted-foreground">
          {title}
        </h3>
        <p className="mb-4 text-muted-foreground">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 