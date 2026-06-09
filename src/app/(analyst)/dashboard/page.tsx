'use client'

import dynamic from 'next/dynamic'
import { CheckCircle, Clock, Activity } from 'lucide-react'
import { ReportFeed } from '@/components/analyst/ReportFeed'
import { ReportDetail } from '@/components/analyst/ReportDetail'
import { useAnalystReports, useReportStats, useHeatmapData } from '@/hooks/useAnalystReports'
import { useMapStore } from '@/stores/map.store'

// ── Dynamic imports (no SSR) ──────────────────────────────────────────────────

const CrisisMap = dynamic(
  () => import('@/components/map/CrisisMap').then((m) => m.CrisisMap),
  { ssr: false },
)

const ClusterLayer = dynamic(
  () => import('@/components/map/ClusterLayer').then((m) => m.ClusterLayer),
  { ssr: false },
)

const HeatmapLayer = dynamic(
  () => import('@/components/map/HeatmapLayer').then((m) => m.HeatmapLayer),
  { ssr: false },
)

// ── Stats card ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatsCard({ label, value, icon, color }: StatsCardProps) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${color}`}>
      <div className="shrink-0" aria-hidden="true">{icon}</div>
      <div>
        <p className="text-xl font-bold leading-none">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useAnalystReports()
  const { data: stats } = useReportStats()
  const { data: heatmapPoints } = useHeatmapData()
  const { selectedReportId, setSelectedReportId } = useMapStore()

  const reports = data?.items ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0 overflow-x-auto">
        <StatsCard
          label="Total"
          value={stats?.total ?? 0}
          icon={<Activity className="h-4 w-4 text-blue-600" />}
          color="border-blue-200 bg-blue-50/50"
        />
        <StatsCard
          label="Destroyed"
          value={stats?.by_severity.destroyed ?? 0}
          icon={<CheckCircle className="h-4 w-4 text-red-600" />}
          color="border-red-200 bg-red-50/50"
        />
        <StatsCard
          label="Partial"
          value={stats?.by_severity.partial ?? 0}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          color="border-amber-200 bg-amber-50/50"
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative">
          <CrisisMap className="w-full h-full">
            <ClusterLayer
              reports={reports}
              onReportClick={(id) => setSelectedReportId(id)}
            />
            <HeatmapLayer
              points={(heatmapPoints?.features ?? []).map((f) => ({
                lat: f.geometry.coordinates[1] ?? 0,
                lng: f.geometry.coordinates[0] ?? 0,
                weight: f.properties.weight,
              }))}
            />
          </CrisisMap>
        </div>

        {/* Right panel: feed or detail */}
        <div className="w-80 shrink-0 flex flex-col border-l border-border overflow-hidden">
          {selectedReportId !== null ? (
            <ReportDetail
              reportId={selectedReportId}
              onClose={() => setSelectedReportId(null)}
            />
          ) : (
            <ReportFeed
              reports={reports}
              selectedId={selectedReportId}
              onSelect={(id) => setSelectedReportId(id)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
