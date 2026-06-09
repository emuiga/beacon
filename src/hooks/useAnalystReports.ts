'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import { useMapStore } from '@/stores/map.store'
import type {
  AnalystReportDetail,
  ReportSummary,
  PaginatedReports,
  StatsSummary,
  HeatmapResponse,
  StatusTransitionRequest,
  StatusTransitionResponse,
  AnalystNoteCreateRequest,
  AnalystNote,
  MergeRequest,
  MergeResponse,
} from '@/types/api'

function buildQuery(
  filters: ReturnType<typeof useMapStore.getState>['activeFilters'],
  page = 1,
): string {
  const params = new URLSearchParams()
  if (filters.crisisType !== null) params.set('crisis_type', filters.crisisType)
  if (filters.damageSeverity !== null) params.set('damage_severity', filters.damageSeverity)
  if (filters.infrastructureType !== null) params.set('infrastructure_type', filters.infrastructureType)
  if (filters.status !== null) params.set('status', filters.status)
  if (filters.timeFrom !== null) params.set('time_from', filters.timeFrom)
  if (filters.timeTo !== null) params.set('time_to', filters.timeTo)
  params.set('page', String(page))
  params.set('limit', '50')
  return params.toString()
}

export function useAnalystReports(page = 1) {
  const { activeFilters } = useMapStore()
  return useQuery({
    queryKey: ['analyst-reports', activeFilters, page],
    queryFn: () =>
      api.get<PaginatedReports>(`/analyst/reports?${buildQuery(activeFilters, page)}`),
  })
}

export function useAnalystReport(id: string) {
  return useQuery({
    queryKey: ['analyst-report', id],
    queryFn: () => api.get<AnalystReportDetail>(`/analyst/reports/${id}`),
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
    queryFn: () => api.get<HeatmapResponse>('/stats/heatmap'),
    staleTime: 60_000,
  })
}

export function useUpdateReportStatus() {
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: StatusTransitionRequest & { id: string }): Promise<StatusTransitionResponse> =>
      api.patch<StatusTransitionResponse>(`/analyst/reports/${id}/status`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['analyst-reports'] })
      void queryClient.invalidateQueries({ queryKey: ['analyst-report'] })
    },
  })
}

export function useAddAnalystNote(reportId: string) {
  return useMutation({
    mutationFn: (body: AnalystNoteCreateRequest): Promise<AnalystNote> =>
      api.post<AnalystNote>(`/analyst/reports/${reportId}/notes`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['analyst-report', reportId] })
    },
  })
}

export function useMergeReports() {
  return useMutation({
    mutationFn: (body: MergeRequest): Promise<MergeResponse> =>
      api.post<MergeResponse>('/analyst/reports/merge', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['analyst-reports'] })
    },
  })
}

// Re-export for convenience
export type { ReportSummary, AnalystReportDetail }
