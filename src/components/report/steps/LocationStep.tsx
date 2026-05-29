'use client'

import { useState } from 'react'
import { MapPin, Loader2, AlertCircle, CheckCircle2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck'
import { matchBuilding } from '@/features/geolocation/building-match'
import { DuplicateWarning } from '../DuplicateWarning'
import { DUPLICATE_WARN_THRESHOLD } from '@/lib/constants'
import type { BuildingMatch } from '@/types/api'

interface LocationStepProps {
  onDiscard: () => void
}

const GPS_ERROR_MESSAGES: Record<string, string> = {
  permission_denied: 'Location access denied. Please use the text description below.',
  position_unavailable: 'Could not determine location. Please use the text description below.',
  timeout: 'GPS timed out. Please try again or use the text description.',
  unsupported: 'GPS not available. Please describe the location below.',
}

export function LocationStep({ onDiscard }: LocationStepProps) {
  const { draft, setField } = useReportDraftStore()
  const { state, request, isRequesting } = useGeolocation()
  const [buildingMatch, setBuildingMatch] = useState<BuildingMatch | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [duplicateDismissed, setDuplicateDismissed] = useState(false)

  const { data: nearbyReports } = useDuplicateCheck(draft.lat, draft.lng)

  const duplicates = (nearbyReports ?? []).filter(
    (r) => r.similarity_score > DUPLICATE_WARN_THRESHOLD,
  )
  const showDuplicateWarning = duplicates.length > 0 && !duplicateDismissed

  async function handleGetGPS() {
    await request()
    if (state.status === 'acquired') {
      setField('lat', state.coords.lat)
      setField('lng', state.coords.lng)
      fetchBuildingMatch(state.coords.lat, state.coords.lng)
    }
  }

  // request() is async but state updates async too — use the returned value via effect
  // We use an explicit handler that reads the result directly
  async function handleGetGPSWithResult() {
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
        <h2 className="text-xl font-semibold mb-1">Where is the damage?</h2>
        <p className="text-muted-foreground text-sm">
          Use GPS for accuracy, or describe the location in text.
        </p>
      </div>

      {/* GPS section */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          variant={hasCoords ? 'outline' : 'default'}
          className="w-full h-14 text-base gap-2"
          onClick={() => { void handleGetGPSWithResult() }}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-5 w-5" aria-hidden="true" />
          )}
          {isRequesting ? 'Getting location…' : hasCoords ? 'Update GPS Location' : 'Get GPS Location'}
        </Button>

        {/* GPS acquired */}
        {hasCoords && (
          <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium">Location set</span>
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
            <span>{GPS_ERROR_MESSAGES[state.error] ?? 'Could not get location.'}</span>
          </div>
        )}

        {/* Building match */}
        {(matchLoading || buildingMatch !== null) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {matchLoading
              ? 'Looking up building…'
              : buildingMatch?.building_id !== null
              ? `Building matched (${Math.round((buildingMatch?.confidence ?? 0) * 100)}% confidence, ${Math.round(buildingMatch?.distance_m ?? 0)}m away)`
              : 'No building footprint found — unmapped structure.'}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <div className="flex-1 border-t border-border" />
        <span>or describe the location</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Landmark text */}
      <div>
        <label htmlFor="landmark" className="block text-sm font-medium mb-1.5">
          Landmark or address description
        </label>
        <textarea
          id="landmark"
          rows={3}
          placeholder="e.g. Blue house on the corner of Market Road and 3rd Street, near the water tower"
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
