import { describe, it, expect, vi } from 'vitest'
import { extractGpsFromExif } from '../exif'

vi.mock('exifr', () => ({
  gps: vi.fn(),
}))

import { gps } from 'exifr'
const mockGps = vi.mocked(gps)

function makeFile(): File {
  return new File([new ArrayBuffer(1024)], 'photo.jpg', { type: 'image/jpeg' })
}

describe('extractGpsFromExif', () => {
  it('returns coordinates when EXIF GPS is present', async () => {
    mockGps.mockResolvedValue({ latitude: -1.2921, longitude: 36.8219 })
    const result = await extractGpsFromExif(makeFile())
    expect(result).toEqual({ latitude: -1.2921, longitude: 36.8219 })
  })

  it('returns null when GPS data is absent (undefined)', async () => {
    mockGps.mockResolvedValue(undefined as never)
    const result = await extractGpsFromExif(makeFile())
    expect(result).toBeNull()
  })

  it('returns null when latitude/longitude are not numbers', async () => {
    mockGps.mockResolvedValue({ latitude: 'N/A', longitude: 'N/A' } as never)
    const result = await extractGpsFromExif(makeFile())
    expect(result).toBeNull()
  })

  it('returns null when coordinates are non-finite', async () => {
    mockGps.mockResolvedValue({ latitude: NaN, longitude: Infinity })
    const result = await extractGpsFromExif(makeFile())
    expect(result).toBeNull()
  })

  it('returns null and does not throw when exifr throws', async () => {
    mockGps.mockRejectedValue(new Error('EXIF parse error'))
    const result = await extractGpsFromExif(makeFile())
    expect(result).toBeNull()
  })
})
