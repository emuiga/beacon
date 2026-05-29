'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SeverityBadge } from '@/components/analyst/SeverityBadge'
import type { ReportResponse } from '@/types/api'
import '@/lib/i18n'

// MapLibre is heavy (~500 KB gzipped). Dynamic import means it only loads
// when the Map tab is actually opened — critical for low-end devices where
// every KB of JS parse time is expensive.
const CrisisMap   = dynamic(() => import('@/components/map/CrisisMap').then((m) => m.CrisisMap),   { ssr: false })
const ClusterLayer = dynamic(() => import('@/components/map/ClusterLayer').then((m) => m.ClusterLayer), { ssr: false })
const HeatmapLayer = dynamic(() => import('@/components/map/HeatmapLayer').then((m) => m.HeatmapLayer), { ssr: false })

interface PublicReport {
  id: string
  lat: number | null
  lng: number | null
  damage_severity: ReportResponse['damage_severity']
  crisis_type:     ReportResponse['crisis_type']
  infrastructure_type: ReportResponse['infrastructure_type']
  submitted_at: string
}

function usePublicReports() {
  return useQuery<PublicReport[]>({
    queryKey: ['public-reports'],
    queryFn:  () => api.get<PublicReport[]>('/reports/public'),
    // Refresh every 2 minutes — public feed doesn't need to be real-time
    refetchInterval: 2 * 60 * 1000,
    // Still show stale data while refetching — avoids map flicker on slow connections
    staleTime: 90 * 1000,
  })
}

interface BottomSheetProps {
  report: PublicReport
  onClose: () => void
}

function BottomSheet({ report, onClose }: BottomSheetProps) {
  const { t } = useTranslation()

  return (
    // Slide-up overlay using CSS transform — GPU composited, runs at 60fps
    // even on low-end devices because it only triggers the compositor layer
    <div
      className="absolute bottom-0 inset-x-0 z-10 bg-background rounded-t-2xl border-t border-border shadow-2xl
                 animate-in slide-in-from-bottom duration-200"
      role="dialog"
      aria-label={t('map.report_detail')}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={report.damage_severity} />
          <span className="text-xs text-muted-foreground">
            {new Date(report.submitted_at).toLocaleDateString()}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('common.close')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-2">
        <p className="text-base font-semibold">
          {t(`report.crisis_type.${report.crisis_type}`)}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(`report.infra_type.${report.infrastructure_type}`)}
          {' · '}
          {t(`report.severity.${report.damage_severity}`)}
        </p>
        {report.lat !== null && report.lng !== null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function PublicMap() {
  const { t } = useTranslation()
  const { data: reports = [] } = usePublicReports()
  const [selected, setSelected] = useState<PublicReport | null>(null)

  const heatmapPoints = reports
    .filter((r) => r.lat !== null && r.lng !== null)
    .map((r) => ({ lat: r.lat!, lng: r.lng!, weight: 1 }))

  function handleReportClick(id: string) {
    const report = reports.find((r) => r.id === id) ?? null
    setSelected(report)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 py-3 border-b border-border bg-background">
        <h1 className="text-base font-semibold">{t('map.title')}</h1>
        <p className="text-xs text-muted-foreground">
          {t('map.report_count', { count: reports.length })}
        </p>
      </header>

      {/* Map fills remaining screen — relative so the bottom sheet overlaps it */}
      <div className="relative flex-1">
        <CrisisMap className="absolute inset-0">
          <HeatmapLayer points={heatmapPoints} visible />
          <ClusterLayer reports={reports} onReportClick={handleReportClick} />
        </CrisisMap>

        {selected !== null && (
          <BottomSheet report={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
