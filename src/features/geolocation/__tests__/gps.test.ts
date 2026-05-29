import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentPosition, watchPosition } from '../gps'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePosition(lat: number, lng: number, accuracy = 10): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  }
}

function makePositionError(code: number): GeolocationPositionError {
  return {
    code,
    message: 'test error',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  }
}

// ── Tests: getCurrentPosition ─────────────────────────────────────────────────

describe('getCurrentPosition', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns coords on success', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success(makePosition(1.2921, 36.8219, 5))
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const result = await getCurrentPosition()

    expect(result.error).toBeNull()
    expect(result.coords).toEqual({ lat: 1.2921, lng: 36.8219, accuracy: 5 })
  })

  it('returns permission_denied error when user denies', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_, error) => {
        error(makePositionError(1)) // PERMISSION_DENIED
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const result = await getCurrentPosition()

    expect(result.coords).toBeNull()
    expect(result.error).toBe('permission_denied')
  })

  it('returns timeout error on timeout', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_, error) => {
        error(makePositionError(3)) // TIMEOUT
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const result = await getCurrentPosition()

    expect(result.coords).toBeNull()
    expect(result.error).toBe('timeout')
  })

  it('returns unsupported when geolocation API is absent', async () => {
    vi.stubGlobal('navigator', {}) // no .geolocation

    const result = await getCurrentPosition()

    expect(result.coords).toBeNull()
    expect(result.error).toBe('unsupported')
  })

  it('returns unsupported in SSR context (no navigator)', async () => {
    vi.stubGlobal('navigator', undefined)

    const result = await getCurrentPosition()

    expect(result.coords).toBeNull()
    expect(result.error).toBe('unsupported')
  })
})

// ── Tests: watchPosition ──────────────────────────────────────────────────────

describe('watchPosition', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls onUpdate with coords', () => {
    const onUpdate = vi.fn()
    const onError = vi.fn()

    const mockGeolocation = {
      watchPosition: vi.fn((success) => {
        success(makePosition(1.0, 36.0, 8))
        return 42
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    const stop = watchPosition(onUpdate, onError)

    expect(onUpdate).toHaveBeenCalledWith({ lat: 1.0, lng: 36.0, accuracy: 8 })
    expect(onError).not.toHaveBeenCalled()

    stop()
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(42)
  })

  it('calls onError when geolocation fails', () => {
    const onUpdate = vi.fn()
    const onError = vi.fn()

    const mockGeolocation = {
      watchPosition: vi.fn((_, error) => {
        error(makePositionError(2)) // POSITION_UNAVAILABLE
        return 1
      }),
      clearWatch: vi.fn(),
      getCurrentPosition: vi.fn(),
    }
    vi.stubGlobal('navigator', { geolocation: mockGeolocation })

    watchPosition(onUpdate, onError)

    expect(onUpdate).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('position_unavailable')
  })

  it('calls onError with unsupported when API is absent', () => {
    vi.stubGlobal('navigator', {})
    const onError = vi.fn()

    const stop = watchPosition(vi.fn(), onError)

    expect(onError).toHaveBeenCalledWith('unsupported')
    stop() // should not throw
  })
})
