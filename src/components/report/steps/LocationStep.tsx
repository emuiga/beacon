'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { MapPin, Loader2, AlertCircle, CheckCircle2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { matchBuilding } from '@/features/geolocation/building-match'
import { DuplicateWarning } from '../DuplicateWarning'
import { DUPLICATE_WARN_THRESHOLD } from '@/lib/constants'
import type { BuildingMatch } from '@/types/api'
import '@/lib/i18n'

// ── Dynamic imports (no SSR) ──────────────────────────────────────────────────

const CrisisMap = dynamic(
  () => import('@/components/map/CrisisMap').then((m) => m.CrisisMap),
  { ssr: false },
)

const DamageMarker = dynamic(
  () => import('@/components/map/DamageMarker').then((m) => m.DamageMarker),
  { ssr: false },
)

const BuildingFootprint = dynamic(
  () => import('@/components/map/BuildingFootprint').then((m) => m.BuildingFootprint),
  { ssr: false },
)

// ── GPS error key → i18n key map ──────────────────────────────────────────────

const GPS_ERROR_KEYS: Record<string, string> = {
  permission_denied:    'report.location.error_permission_denied',
  position_unavailable: 'report.location.error_unavailable',
  timeout:              'report.location.error_timeout',
  unsupported:          'report.location.error_unsupported',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface LocationStepProps {
  onDiscard: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationStep({ onDiscard }: LocationStepProps) {
  const { t } = useTranslation()
  const { draft, setField } = useReportDraftStore()
  const { state, isRequesting } = useGeolocation()
  const [buildingMatch, setBuildingMatch] = useState<BuildingMatch | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [duplicateDismissed, setDuplicateDismissed] = useState(false)

  const { data: nearbyReports } = useDuplicateCheck(draft.lat, draft.lng)

  const duplicates = (nearbyReports ?? []).filter(
    (r) => r.similarity_score > DUPLICATE_WARN_THRESHOLD,
  )
  const showDuplicateWarning = duplicates.length > 0 && !duplicateDismissed

  async function handleGetGPS() {
    const { getCurrentPosition } = await import('@/features/geolocation/gps')
    const result = await getCurrentPosition()
    if (result.coords !== null) {
      setField('lat', result.coords.lat)
      setField('lng', result.coords.lng)
      fetchBuildingMatch(result.coords.lat, result.coords.lng)
    }
  }

  function fetchBuildingMatch(lat: number, lng: number) {
    setMatchLoading(true)
    matchBuilding(lat, lng)
      .then((match) => setBuildingMatch(match))
      .finally(() => setMatchLoading(false))
  }

  const hasCoords = draft.lat !== null && draft.lng !== null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('report.location.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('report.location.description')}</p>
      </div>

      {/* GPS section */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          variant={hasCoords ? 'outline' : 'default'}
          className="w-full h-14 text-base gap-2"
          onClick={() => { void handleGetGPS() }}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-5 w-5" aria-hidden="true" />
          )}
          {isRequesting
            ? t('report.location.getting')
            : hasCoords
              ? t('report.location.update_gps')
              : t('report.location.get_gps')}
        </Button>

        {/* GPS acquired */}
        {hasCoords && (
          <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium">{t('report.location.location_set')}</span>
              <span className="text-green-600 ml-2">
                {draft.lat?.toFixed(5)}, {draft.lng?.toFixed(5)}
              </span>
              {state.status === 'acquired' && (
                <span className="ml-2 text-green-600">
                  ±{Math.round(state.coords.accuracy)}m
                </span>
              )}
            </div>
          </div>
        )}

        {/* GPS error */}
        {state.status === 'error' && (
          <div role="alert" className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{t(GPS_ERROR_KEYS[state.error] ?? 'report.location.error_generic')}</span>
          </div>
        )}

        {/* Building match info */}
        {(matchLoading || buildingMatch !== null) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {matchLoading
              ? t('report.location.looking_up')
              : buildingMatch?.building_id !== null
                ? t('report.location.building_matched', {
                    confidence: Math.round((buildingMatch?.confidence ?? 0) * 100),
                    distance: Math.round(buildingMatch?.distance_m ?? 0),
                  })
                : t('report.location.no_building')}
          </div>
        )}

        {/* Map preview after GPS acquired */}
        {hasCoords && draft.lat !== null && draft.lng !== null && (
          <div className="h-48 sm:h-56 rounded-xl overflow-hidden border border-border">
            <CrisisMap
              className="w-full h-full"
              initialCenter={{ lat: draft.lat, lng: draft.lng }}
              initialZoom={16}
            >
              <DamageMarker
                lat={draft.lat}
                lng={draft.lng}
                severity={draft.damage_severity ?? 'minimal'}
                draggable
                onDragEnd={(newLat, newLng) => {
                  setField('lat', newLat)
                  setField('lng', newLng)
                  fetchBuildingMatch(newLat, newLng)
                }}
              />
              {buildingMatch?.footprint_geojson !== null &&
                buildingMatch?.footprint_geojson !== undefined && (() => {
                  try {
                    const parsed = JSON.parse(buildingMatch.footprint_geojson) as { type: 'Polygon'; coordinates: number[][][] }
                    return <BuildingFootprint geojson={parsed} />
                  } catch {
                    return null
                  }
                })()}
            </CrisisMap>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <div className="flex-1 border-t border-border" />
        <span>{t('report.location.or_describe')}</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Landmark text */}
      <div>
        <label htmlFor="landmark" className="block text-sm font-medium mb-1.5">
          {t('report.location.landmark_label')}
        </label>
        <textarea
          id="landmark"
          rows={3}
          placeholder={t('report.location.landmark_placeholder')}
          value={draft.landmark_description}
          onChange={(e) => setField('landmark_description', e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Duplicate warning */}
      {showDuplicateWarning && (
        <DuplicateWarning
          duplicates={duplicates}
          onSameDamage={onDiscard}
          onDifferentDamage={() => setDuplicateDismissed(true)}
        />
      )}
    </div>
  )
}
