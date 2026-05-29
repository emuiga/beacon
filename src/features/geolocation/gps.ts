import { logger } from '@/lib/logger'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GpsCoords {
  lat: number
  lng: number
  accuracy: number  // metres — show radius on map
}

export type GpsError =
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported'

export interface GpsResult {
  coords: GpsCoords | null
  error: GpsError | null
}

// ── Config ────────────────────────────────────────────────────────────────────

const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,      // 15 s — field use, may have weak signal
  maximumAge: 30_000,   // accept a cached position up to 30 s old
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Use numeric literals — GeolocationPositionError is not available in Node/SSR
const GEO_ERR = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as const

function toGpsError(code: number): GpsError {
  switch (code) {
    case GEO_ERR.PERMISSION_DENIED:    return 'permission_denied'
    case GEO_ERR.POSITION_UNAVAILABLE: return 'position_unavailable'
    case GEO_ERR.TIMEOUT:              return 'timeout'
    default:                           return 'position_unavailable'
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Request the user's current GPS position once.
 *
 * Always resolves — never rejects.
 * On error the returned `error` field describes what went wrong.
 */
export function getCurrentPosition(): Promise<GpsResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    logger.warn('gps: Geolocation API not available')
    return Promise.resolve({ coords: null, error: 'unsupported' })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: GpsCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        logger.debug('gps: position acquired', coords)
        resolve({ coords, error: null })
      },
      (err) => {
        const error = toGpsError(err.code)
        logger.warn('gps: position error', { code: err.code, message: err.message, error })
        resolve({ coords: null, error })
      },
      OPTIONS,
    )
  })
}

/**
 * Watch the user's position continuously.
 * Returns a cleanup function — always call it on unmount.
 */
export function watchPosition(
  onUpdate: (coords: GpsCoords) => void,
  onError: (error: GpsError) => void,
): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError('unsupported')
    return () => { /* no-op */ }
  }

  const id = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    },
    (err) => {
      onError(toGpsError(err.code))
    },
    OPTIONS,
  )

  return () => {
    navigator.geolocation.clearWatch(id)
    logger.debug('gps: watch cleared')
  }
}
