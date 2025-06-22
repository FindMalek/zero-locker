"use client"

import type { Entity } from "@/types/entity"

import { GRID_BREAKPOINTS } from "@/lib/constants"

import { DashboardCredentialCard } from "@/components/app/dashboard-credential-card"

interface EntityGridViewProps {
  entities: Entity[]
  onEdit?: (entity: Entity) => void
  onDelete?: (entity: Entity) => void
}

export function DashboardCredentialGridView({
  entities,
  onEdit,
  onDelete,
}: EntityGridViewProps) {
  const gridClasses = Object.values(GRID_BREAKPOINTS).join(" ")

  return (
    <div className={`grid ${gridClasses} gap-4`}>
      {entities.map((entity) => (
        <DashboardCredentialCard
          key={entity.id}
          entity={entity}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
