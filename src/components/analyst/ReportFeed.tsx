'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ReportCard } from './ReportCard'
import type { ReportSummary } from '@/types/api'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ReportFeedProps {
  reports: ReportSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportFeed({ reports, selectedId, onSelect, isLoading }: ReportFeedProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3" role="status" aria-label="Loading reports">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg border border-border">
            <Skeleton className="w-14 h-14 rounded-md shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">📋</div>
        <p className="text-sm font-medium text-foreground">No reports found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try adjusting the filters or check back later.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-2 p-3 overflow-y-auto"
      role="list"
      aria-label="Report feed"
    >
      {reports.map((report) => (
        <div key={report.id} role="listitem">
          <ReportCard
            report={report}
            selected={selectedId === report.id}
            onClick={() => onSelect(report.id)}
          />
        </div>
      ))}
    </div>
  )
}
