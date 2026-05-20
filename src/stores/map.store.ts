import { create } from 'zustand'
import type { CrisisType, DamageSeverity, InfrastructureType, ReportStatus } from '@/types/api'
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/constants'

interface MapViewport {
  lat: number
  lng: number
  zoom: number
}

interface ActiveFilters {
  crisisType: CrisisType | null
  damageSeverity: DamageSeverity | null
  infrastructureType: InfrastructureType | null
  status: ReportStatus | null
  timeFrom: string | null
  timeTo: string | null
}

interface MapState {
  viewport: MapViewport
  activeFilters: ActiveFilters
  selectedReportId: string | null

  setViewport: (viewport: MapViewport) => void
  setFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void
  clearFilters: () => void
  setSelectedReportId: (id: string | null) => void
}

const defaultFilters: ActiveFilters = {
  crisisType: null,
  damageSeverity: null,
  infrastructureType: null,
  status: null,
  timeFrom: null,
  timeTo: null,
}

export const useMapStore = create<MapState>()((set) => ({
  viewport: {
    lat: MAP_DEFAULT_CENTER.lat,
    lng: MAP_DEFAULT_CENTER.lng,
    zoom: MAP_DEFAULT_ZOOM,
  },
  activeFilters: { ...defaultFilters },
  selectedReportId: null,

  setViewport: (viewport) => set({ viewport }),

  setFilter: (key, value) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: value },
    })),

  clearFilters: () => set({ activeFilters: { ...defaultFilters } }),

  setSelectedReportId: (id) => set({ selectedReportId: id }),
}))
