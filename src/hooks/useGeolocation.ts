import { useState, useCallback, useRef } from 'react'
import {
  getCurrentPosition,
  watchPosition,
  type GpsCoords,
  type GpsError,
} from '@/features/geolocation/gps'

// ── Types ──────────────────────────────────────────────────────────────────────

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'acquired'; coords: GpsCoords }
  | { status: 'error'; error: GpsError }

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manage GPS acquisition for the report wizard.
 *
 * - `request()` fires a one-shot getCurrentPosition call.
 * - `startWatch()` begins continuous position updates (e.g. while map is open).
 * - `stopWatch()` clears the watcher — call on step unmount.
 * - `override(coords)` lets the user manually drag a map pin to correct position.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })
  const stopWatchRef = useRef<(() => void) | null>(null)

  const request = useCallback(async () => {
    setState({ status: 'requesting' })
    const result = await getCurrentPosition()
    if (result.coords !== null) {
      setState({ status: 'acquired', coords: result.coords })
    } else {
      setState({ status: 'error', error: result.error ?? 'position_unavailable' })
    }
  }, [])

  const startWatch = useCallback(() => {
    // Don't start a second watcher if one is already running
    if (stopWatchRef.current !== null) return

    setState({ status: 'requesting' })

    const stop = watchPosition(
      (coords) => {
        setState({ status: 'acquired', coords })
      },
      (error) => {
        setState({ status: 'error', error })
      },
    )

    stopWatchRef.current = stop
  }, [])

  const stopWatch = useCallback(() => {
    if (stopWatchRef.current !== null) {
      stopWatchRef.current()
      stopWatchRef.current = null
    }
  }, [])

  /** Manually override the position — used when the user drags the map pin. */
  const override = useCallback((coords: GpsCoords) => {
    setState({ status: 'acquired', coords })
  }, [])

  const reset = useCallback(() => {
    stopWatch()
    setState({ status: 'idle' })
  }, [stopWatch])

  return {
    state,
    /** One-shot GPS request */
    request,
    /** Start continuous position watching */
    startWatch,
    /** Stop continuous position watching */
    stopWatch,
    /** Override coords (user dragged pin) */
    override,
    /** Reset back to idle */
    reset,
    // Convenience derivations
    coords: state.status === 'acquired' ? state.coords : null,
    isRequesting: state.status === 'requesting',
    hasError: state.status === 'error',
    error: state.status === 'error' ? state.error : null,
  }
}
