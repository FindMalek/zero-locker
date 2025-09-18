import { Icons } from "@/components/shared/icons"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardCredentialKeyValuePairsSkeleton() {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Additional Information</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Secure key-value pairs for extra credential details</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Content Container - matches KeyValuePairManager exactly */}
      <div
        className="overflow-hidden rounded-lg border"
        role="region"
        aria-label="Additional Information data entry form"
      >
        <div
          className="space-y-0"
          role="group"
          aria-describedby="kv-pairs-description"
        >
          {/* Screen reader description */}
          <div id="kv-pairs-description" className="sr-only">
            Secure key-value pairs for extra credential details. Use Tab to
            navigate between fields. Use Ctrl+Enter to add a new pair.
          </div>

          {/* Show single skeleton row (matches default empty state) */}
          <div className="flex items-start gap-2 p-3 sm:gap-3 sm:p-4">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {/* Key Column */}
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                  Key
                </Label>
                <div id="key-help-0" className="sr-only">
                  Enter a unique key name for this pair. Keys must be unique
                  within the form.
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Value Column */}
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                  Value
                </Label>
                <div id="value-help-0" className="sr-only">
                  Enter the value for this pair. Values are encrypted when
                  saved.
                </div>
                <div className="relative">
                  <Skeleton className="h-10 w-full" />
                  {/* Eye/Copy icon placeholders - matches password-copyable variant */}
                  <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                    <Skeleton className="size-8" />
                    <Skeleton className="size-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* No remove button for single row - matches real behavior */}
          </div>

          {/* Add button skeleton */}
          <div className="border-border border-t p-3 sm:p-4">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
