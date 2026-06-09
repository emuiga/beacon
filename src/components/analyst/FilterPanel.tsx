'use client'

import { useMapStore } from '@/stores/map.store'
import { Button } from '@/components/ui/button'
import {
  CRISIS_TYPE_LABELS,
  DAMAGE_SEVERITY_LABELS,
  INFRASTRUCTURE_TYPE_LABELS,
} from '@/lib/constants'
import type { CrisisType, DamageSeverity, InfrastructureType, ReportStatus } from '@/types/api'

// ── Status labels ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  duplicate: 'Duplicate',
  rejected: 'Rejected',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FilterPanel() {
  const { activeFilters, setFilter, clearFilters } = useMapStore()

  const hasActiveFilters =
    activeFilters.crisisType !== null ||
    activeFilters.damageSeverity !== null ||
    activeFilters.infrastructureType !== null ||
    activeFilters.status !== null ||
    activeFilters.timeFrom !== null ||
    activeFilters.timeTo !== null

  return (
    <aside className="flex flex-col gap-4 p-4" aria-label="Report filters">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6 px-2"
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Crisis Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-crisis" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Crisis Type
        </label>
        <select
          id="filter-crisis"
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={activeFilters.crisisType ?? ''}
          onChange={(e) =>
            setFilter('crisisType', e.target.value === '' ? null : (e.target.value as CrisisType))
          }
          aria-label="Filter by crisis type"
        >
          <option value="">All</option>
          {Object.entries(CRISIS_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Damage Severity */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-severity" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Damage Severity
        </label>
        <select
          id="filter-severity"
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={activeFilters.damageSeverity ?? ''}
          onChange={(e) =>
            setFilter('damageSeverity', e.target.value === '' ? null : (e.target.value as DamageSeverity))
          }
          aria-label="Filter by damage severity"
        >
          <option value="">All</option>
          {Object.entries(DAMAGE_SEVERITY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Infrastructure Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-infra" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Infrastructure
        </label>
        <select
          id="filter-infra"
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={activeFilters.infrastructureType ?? ''}
          onChange={(e) =>
            setFilter(
              'infrastructureType',
              e.target.value === '' ? null : (e.target.value as InfrastructureType),
            )
          }
          aria-label="Filter by infrastructure type"
        >
          <option value="">All</option>
          {Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-status" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </label>
        <select
          id="filter-status"
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={activeFilters.status ?? ''}
          onChange={(e) =>
            setFilter('status', e.target.value === '' ? null : (e.target.value as ReportStatus))
          }
          aria-label="Filter by status"
        >
          <option value="">All</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Date Range
        </span>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-from" className="sr-only">From date</label>
          <input
            id="filter-from"
            type="date"
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={activeFilters.timeFrom ?? ''}
            onChange={(e) => setFilter('timeFrom', e.target.value === '' ? null : e.target.value)}
            aria-label="Filter from date"
          />
          <label htmlFor="filter-to" className="sr-only">To date</label>
          <input
            id="filter-to"
            type="date"
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={activeFilters.timeTo ?? ''}
            onChange={(e) => setFilter('timeTo', e.target.value === '' ? null : e.target.value)}
            aria-label="Filter to date"
          />
        </div>
      </div>
    </aside>
  )
}
