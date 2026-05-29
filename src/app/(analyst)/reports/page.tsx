'use client'

import { useState } from 'react'
import { FilterPanel } from '@/components/analyst/FilterPanel'
import { ReportCard } from '@/components/analyst/ReportCard'
import { ReportDetail } from '@/components/analyst/ReportDetail'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAnalystReports } from '@/hooks/useAnalystReports'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsListPage() {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useAnalystReports(page)
  const reports = data?.items ?? []
  const hasMore = data?.has_more ?? false
  const total = data?.total ?? 0

  return (
    <div className="flex h-full overflow-hidden">
      {/* Filter sidebar */}
      <div className="hidden md:block w-52 shrink-0 border-r border-border overflow-y-auto">
        <FilterPanel />
      </div>

      {/* Reports list */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h1 className="text-sm font-semibold">
            Reports {total > 0 && <span className="text-muted-foreground font-normal">({total.toLocaleString()} total)</span>}
          </h1>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border border-border">
                  <Skeleton className="w-14 h-14 rounded-md shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && reports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <p className="text-sm font-medium">No reports found</p>
              <p className="text-xs text-muted-foreground mt-1">Adjust filters to see more</p>
            </div>
          )}

          {!isLoading && (
            <div className="flex flex-col gap-2 p-4">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  selected={selectedId === report.id}
                  onClick={() => setSelectedId(selectedId === report.id ? null : report.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && (reports.length > 0 || page > 1) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedId !== null && (
        <div className="hidden lg:flex w-96 shrink-0 overflow-hidden">
          <ReportDetail
            reportId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  )
}
