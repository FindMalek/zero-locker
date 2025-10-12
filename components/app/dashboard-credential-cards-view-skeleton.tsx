import { Skeleton } from "@/components/ui/skeleton"

export function DashboardCredentialCardsViewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-border hover:border-primary/50 group relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-white p-4 transition-all hover:shadow-md"
        >
          {/* Left side - Platform logo and info */}
          <div className="flex flex-1 items-center gap-4">
            <Skeleton className="size-12 shrink-0 rounded-lg" />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="size-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Middle - Tags */}
          <div className="hidden items-center gap-2 lg:flex">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Right side - Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
