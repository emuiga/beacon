'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, CheckCircle, XCircle, Copy, Loader2, MapPin, Zap, Heart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SeverityBadge } from './SeverityBadge'
import { useAnalystReport, useUpdateReportStatus } from '@/hooks/useAnalystReports'
import { CRISIS_TYPE_LABELS, INFRASTRUCTURE_TYPE_LABELS } from '@/lib/constants'
import { logger } from '@/lib/logger'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ReportDetailProps {
  reportId: string
  onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function tristate(val: boolean | null, trueLabel: string, falseLabel: string): string {
  if (val === true) return trueLabel
  if (val === false) return falseLabel
  return 'Unknown'
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportDetail({ reportId, onClose }: ReportDetailProps) {
  const { data: report, isLoading, isError } = useAnalystReport(reportId)
  const { mutate: updateStatus, isPending } = useUpdateReportStatus()
  const [notes, setNotes] = useState('')

  function handleAction(status: 'verified' | 'rejected' | 'duplicate') {
    updateStatus(
      { id: reportId, status, notes: notes.trim() !== '' ? notes.trim() : null },
      {
        onSuccess: () => {
          toast.success(`Report marked as ${status}`)
          setNotes('')
        },
        onError: (err) => {
          logger.error('Status update failed', err)
          toast.error('Failed to update report status')
        },
      },
    )
  }

  return (
    <div
      className="flex flex-col h-full bg-background border-l border-border overflow-hidden"
      role="region"
      aria-label="Report detail"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Report Detail</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close detail panel"
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm text-destructive font-medium">Failed to load report</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again</p>
          </div>
        )}

        {report !== undefined && (
          <div className="flex flex-col gap-4 p-4">
            {/* Photo */}
            {report.photo_url !== null && (
              <div className="rounded-lg overflow-hidden bg-muted aspect-video relative">
                <Image
                  src={report.photo_url}
                  alt="Damage photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 400px) 100vw, 400px"
                />
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={report.damage_severity} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {CRISIS_TYPE_LABELS[report.crisis_type] ?? report.crisis_type}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                {INFRASTRUCTURE_TYPE_LABELS[report.infrastructure_type] ?? report.infrastructure_type}
              </span>
            </div>

            {/* Location */}
            {(report.lat !== null || report.landmark_description !== null) && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {report.lat !== null && report.lng !== null
                    ? `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`
                    : (report.landmark_description ?? 'No location')}
                </span>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground">
              Submitted: {formatDate(report.submitted_at)}
            </div>

            {/* Infrastructure status */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500 shrink-0" aria-hidden="true" />
                <span>Electricity: {tristate(report.electricity_status, 'Working', 'Not working')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
                <span>Health services: {tristate(report.health_services_status, 'Operational', 'Not operational')}</span>
              </div>
              {report.debris_clearing_needed && (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-orange-500 shrink-0" aria-hidden="true" />
                  <span>Debris clearing needed</span>
                </div>
              )}
            </div>

            {/* Most pressing needs */}
            {report.most_pressing_needs !== null && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Most pressing needs</p>
                <p className="text-sm">{report.most_pressing_needs}</p>
              </div>
            )}

            {/* AI confidence */}
            {report.ai_confidence !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI confidence</span>
                <span className="font-medium">{Math.round(report.ai_confidence * 100)}%</span>
              </div>
            )}

            {/* Analyst notes */}
            {report.analyst_notes !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-1">Analyst notes</p>
                <p className="text-sm text-blue-900">{report.analyst_notes}</p>
              </div>
            )}

            {/* Divider */}
            <hr className="border-border" />

            {/* Notes input */}
            <div>
              <label htmlFor="analyst-notes" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Add notes (optional)
              </label>
              <textarea
                id="analyst-notes"
                rows={2}
                placeholder="Notes for this action…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                className="w-full gap-2"
                disabled={isPending}
                onClick={() => handleAction('verified')}
                aria-label="Verify this report"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                )}
                Verify
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2"
                disabled={isPending}
                onClick={() => handleAction('rejected')}
                aria-label="Reject this report"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={isPending}
                onClick={() => handleAction('duplicate')}
                aria-label="Flag as duplicate"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Flag Duplicate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
