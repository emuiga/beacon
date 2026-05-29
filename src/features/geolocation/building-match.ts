import { api } from '@/lib/api'
import { logger } from '@/lib/logger'
import type { BuildingMatch } from '@/types/api'

/**
 * Ask the backend to match a lat/lng coordinate against the Microsoft Africa
 * Building Footprints dataset stored in PostGIS.
 *
 * Returns null if the request fails (offline, server error) — callers should
 * treat null as "no match found" and continue without a footprint.
 */
export async function matchBuilding(
  lat: number,
  lng: number,
): Promise<BuildingMatch | null> {
  try {
    const match = await api.get<BuildingMatch>(
      `/gis/building/match?lat=${lat}&lng=${lng}`,
    )
    logger.debug('building-match: matched', {
      lat,
      lng,
      building_id: match.building_id,
      confidence: match.confidence,
    })
    return match
  } catch (err) {
    logger.warn('building-match: failed, continuing without footprint', { lat, lng, err })
    return null
  }
}
