import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BuildingMatch } from '@/types/api'

// Partially mock — keep real ApiError/NetworkError, only mock api.get
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      del: vi.fn(),
    },
  }
})

// Mock logger to suppress output in tests
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { matchBuilding } from '../building-match'
import { api } from '@/lib/api'

const mockApi = vi.mocked(api)

const MOCK_MATCH: BuildingMatch = {
  building_id: 'building-123',
  footprint_geojson: JSON.stringify({
    type: 'Polygon',
    coordinates: [[[36.8, 1.2], [36.81, 1.2], [36.81, 1.21], [36.8, 1.21], [36.8, 1.2]]],
  }),
  confidence: 0.87,
  distance_m: 4.2,
}

describe('matchBuilding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a BuildingMatch on success', async () => {
    mockApi.get.mockResolvedValueOnce(MOCK_MATCH)

    const result = await matchBuilding(1.2921, 36.8219)

    expect(result).toEqual(MOCK_MATCH)
    expect(mockApi.get).toHaveBeenCalledWith(
      '/gis/building/match?lat=1.2921&lng=36.8219',
    )
  })

  it('returns null when the API throws (offline / error)', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network unavailable'))

    const result = await matchBuilding(1.0, 36.0)

    expect(result).toBeNull()
  })

  it('returns null when the API returns a 404', async () => {
    const { ApiError } = await import('@/lib/api')
    mockApi.get.mockRejectedValueOnce(new ApiError(404, 'Not found'))

    const result = await matchBuilding(0, 0)

    expect(result).toBeNull()
  })

  it('passes lat and lng correctly in query string', async () => {
    mockApi.get.mockResolvedValueOnce({
      ...MOCK_MATCH,
      building_id: null,
      confidence: 0,
      distance_m: 999,
    })

    await matchBuilding(-1.286389, 36.817223)

    expect(mockApi.get).toHaveBeenCalledWith(
      '/gis/building/match?lat=-1.286389&lng=36.817223',
    )
  })
})
