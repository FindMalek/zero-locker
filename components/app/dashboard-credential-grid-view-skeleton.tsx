import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardCredentialGridViewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="size-8 rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Identifier */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="size-5 rounded" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
