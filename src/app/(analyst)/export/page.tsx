'use client'

import { ExportPanel } from '@/components/analyst/ExportPanel'
import { FilterPanel } from '@/components/analyst/FilterPanel'
import { useMapStore } from '@/stores/map.store'
import { CRISIS_TYPE_LABELS, DAMAGE_SEVERITY_LABELS, INFRASTRUCTURE_TYPE_LABELS } from '@/lib/constants'
import type { AnalystFilters } from '@/types/api'

function buildFilters(
  activeFilters: ReturnType<typeof useMapStore.getState>['activeFilters'],
): AnalystFilters {
  return {
    crisis_type: activeFilters.crisisType,
    damage_severity: activeFilters.damageSeverity,
    infrastructure_type: activeFilters.infrastructureType,
    status: activeFilters.status,
    time_from: activeFilters.timeFrom,
    time_to: activeFilters.timeTo,
    page: 1,
    limit: 200,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { activeFilters } = useMapStore()
  const filters = buildFilters(activeFilters)

  const hasFilters =
    activeFilters.crisisType !== null ||
    activeFilters.damageSeverity !== null ||
    activeFilters.infrastructureType !== null ||
    activeFilters.status !== null ||
    activeFilters.timeFrom !== null ||
    activeFilters.timeTo !== null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Filter sidebar */}
      <div className="hidden md:block w-52 shrink-0 border-r border-border overflow-y-auto">
        <FilterPanel />
      </div>

      {/* Export content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-semibold">Export Data</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Download filtered report data in your preferred format.
            </p>
          </div>

          {/* Active filters summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Current Filters
            </h2>
            {hasFilters ? (
              <ul className="flex flex-col gap-1 text-sm">
                {activeFilters.crisisType !== null && (
                  <li>
                    <span className="text-muted-foreground">Crisis type:</span>{' '}
                    <span className="font-medium">
                      {CRISIS_TYPE_LABELS[activeFilters.crisisType] ?? activeFilters.crisisType}
                    </span>
                  </li>
                )}
                {activeFilters.damageSeverity !== null && (
                  <li>
                    <span className="text-muted-foreground">Severity:</span>{' '}
                    <span className="font-medium">
                      {DAMAGE_SEVERITY_LABELS[activeFilters.damageSeverity] ?? activeFilters.damageSeverity}
                    </span>
                  </li>
                )}
                {activeFilters.infrastructureType !== null && (
                  <li>
                    <span className="text-muted-foreground">Infrastructure:</span>{' '}
                    <span className="font-medium">
                      {INFRASTRUCTURE_TYPE_LABELS[activeFilters.infrastructureType] ?? activeFilters.infrastructureType}
                    </span>
                  </li>
                )}
                {activeFilters.status !== null && (
                  <li>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <span className="font-medium capitalize">{activeFilters.status}</span>
                  </li>
                )}
                {activeFilters.timeFrom !== null && (
                  <li>
                    <span className="text-muted-foreground">From:</span>{' '}
                    <span className="font-medium">{activeFilters.timeFrom}</span>
                  </li>
                )}
                {activeFilters.timeTo !== null && (
                  <li>
                    <span className="text-muted-foreground">To:</span>{' '}
                    <span className="font-medium">{activeFilters.timeTo}</span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">All reports (no filters applied)</p>
            )}
          </div>

          <ExportPanel filters={filters} />
        </div>
      </div>
    </div>
  )
}
