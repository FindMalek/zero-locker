"use client"

import { useState } from "react"
import { mockEntities } from "@/data/mock-entities"
import { Grid3X3, List, Plus } from "lucide-react"

import type { ViewMode } from "@/types/common"
import type { Entity } from "@/types/entity"

import { useEntityFilters } from "@/hooks/use-entity-filters"
import { useEntitySorting } from "@/hooks/use-entity-sorting"

import { Button } from "@/components/ui/button"

import { DashboardCredentialFilters } from "../app/dashboard-credential-filters"
import { DashboardCredentialGridView } from "../app/dashboard-credential-grid-view"
import { EntityListView } from "./entity-list-view"

export default function EntityShowcase() {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    platforms,
    filteredEntities,
    clearFilters,
  } = useEntityFilters(mockEntities)

  const { sortField, sortDirection, handleSort, sortedEntities } =
    useEntitySorting(filteredEntities)

  const handleEdit = (entity: Entity) => {
    console.log("Edit entity:", entity.id)
  }

  const handleDelete = (entity: Entity) => {
    console.log("Delete entity:", entity.id)
  }

  const handleAddEntity = () => {
    console.log("Add new entity")
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Entities</h1>
            <p className="mt-1 text-gray-600">
              Manage your accounts and credentials
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            <div className="flex items-center rounded-lg border bg-white p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            <Button className="h-9" onClick={handleAddEntity}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entity
            </Button>
          </div>
        </div>

        {/* Filters */}
        <DashboardCredentialFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          platforms={platforms}
        />

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {sortedEntities.length}{" "}
            {sortedEntities.length === 1 ? "entity" : "entities"}
          </p>
        </div>

        {/* Content */}
        {sortedEntities.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              <Grid3X3 className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No entities found
            </h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              <EntityListView
                entities={sortedEntities}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <DashboardCredentialGridView
                entities={sortedEntities}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
