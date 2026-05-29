'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { useMapStore } from '@/stores/map.store'
import type {
  AnalystReport,
  PaginatedResponse,
  StatsSummary,
  HeatmapPoint,
  ReportStatus,
  AnalystFilters,
} from '@/types/api'

// ── Query key builders ────────────────────────────────────────────────────────

function buildQuery(filters: ReturnType<typeof useMapStore.getState>['activeFilters'], page = 1): string {
  const params = new URLSearchParams()
  if (filters.crisisType !== null) params.set('crisis_type', filters.crisisType)
  if (filters.damageSeverity !== null) params.set('damage_severity', filters.damageSeverity)
  if (filters.infrastructureType !== null) params.set('infrastructure_type', filters.infrastructureType)
  if (filters.status !== null) params.set('status', filters.status)
  if (filters.timeFrom !== null) params.set('time_from', filters.timeFrom)
  if (filters.timeTo !== null) params.set('time_to', filters.timeTo)
  params.set('page', String(page))
  params.set('page_size', '50')
  return params.toString()
}

export function buildAnalystFilters(
  filters: ReturnType<typeof useMapStore.getState>['activeFilters'],
  page = 1,
): AnalystFilters {
  return {
    crisis_type: filters.crisisType,
    damage_severity: filters.damageSeverity,
    infrastructure_type: filters.infrastructureType,
    status: filters.status,
    time_from: filters.timeFrom,
    time_to: filters.timeTo,
    page,
    page_size: 50,
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAnalystReports(page = 1) {
  const { activeFilters } = useMapStore()
  return useQuery({
    queryKey: ['analyst-reports', activeFilters, page],
    queryFn: () =>
      api.get<PaginatedResponse<AnalystReport>>(
        `/analyst/reports?${buildQuery(activeFilters, page)}`,
      ),
  })
}

export function useAnalystReport(id: string) {
  return useQuery({
    queryKey: ['analyst-report', id],
    queryFn: () => api.get<AnalystReport>(`/analyst/reports/${id}`),
    enabled: id !== '',
  })
}

export function useReportStats() {
  return useQuery({
    queryKey: ['stats-summary'],
    queryFn: () => api.get<StatsSummary>('/stats/summary'),
    staleTime: 60_000,
  })
}

export function useHeatmapData() {
  return useQuery({
    queryKey: ['stats-heatmap'],
    queryFn: () => api.get<HeatmapPoint[]>('/stats/heatmap'),
    staleTime: 60_000,
  })
}

export function useUpdateReportStatus() {
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string
      status: ReportStatus
      notes: string | null
    }) => api.patch(`/analyst/reports/${id}/status`, { status, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['analyst-reports'] })
      void queryClient.invalidateQueries({ queryKey: ['analyst-report'] })
    },
  })
}
