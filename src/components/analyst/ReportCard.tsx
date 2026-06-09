'use client'

import { cn } from '@/lib/utils'
import { SeverityBadge } from './SeverityBadge'
import { CRISIS_TYPE_LABELS, INFRASTRUCTURE_TYPE_LABELS } from '@/lib/constants'
import type { ReportSummary } from '@/types/api'

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  duplicate: 'bg-gray-100 text-gray-600 border-gray-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ReportCardProps {
  report: ReportSummary
  selected: boolean
  onClick: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportCard({ report, selected, onClick }: ReportCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors flex gap-3 hover:bg-muted/50',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-background',
      )}
      aria-pressed={selected}
      aria-label={`Report ${report.id} — ${report.damage_severity} damage`}
    >
      {/* Thumbnail placeholder — photo_url not included in list view */}
      <div className="w-14 h-14 rounded-md shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-xs">
        📷
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={report.damage_severity} />
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
              STATUS_CLASSES[report.status] ?? 'bg-gray-100 text-gray-600 border-gray-200',
            )}
          >
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <span className="font-medium text-foreground">
            {CRISIS_TYPE_LABELS[report.crisis_type] ?? report.crisis_type}
          </span>
          <span>·</span>
          <span>
            {INFRASTRUCTURE_TYPE_LABELS[report.infrastructure_type] ?? report.infrastructure_type}
          </span>
        </div>

        <span className="text-xs text-muted-foreground">
          {relativeTime(report.created_at)}
        </span>
      </div>
    </button>
  )
}
