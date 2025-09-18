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

      {/* Content Container */}
      <div className="overflow-hidden rounded-lg border">
        <div className="space-y-0">
          {/* Skeleton Rows */}
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 sm:gap-3 sm:p-4 ${
                index > 0 ? "border-border border-t" : ""
              }`}
            >
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                {/* Key Column */}
                <div>
                  {index === 0 && (
                    <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                      Key
                    </Label>
                  )}
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Value Column */}
                <div>
                  {index === 0 && (
                    <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                      Value
                    </Label>
                  )}
                  <div className="relative">
                    <Skeleton className="h-10 w-full" />
                    {/* Eye/Copy icon placeholders */}
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
                      <Skeleton className="size-8" />
                      <Skeleton className="size-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove button placeholder */}
              <div className={`flex ${index === 0 ? "pt-6" : "pt-0"}`}>
                <Skeleton className="size-8" />
              </div>
            </div>
          ))}

          {/* Add button skeleton */}
          <div className="border-border border-t p-3 sm:p-4">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
