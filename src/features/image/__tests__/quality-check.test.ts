import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkImageQuality } from '../quality-check'
import {
  IMAGE_MIN_WIDTH,
  IMAGE_MIN_HEIGHT,
} from '@/lib/constants'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFile(sizeBytes: number): File {
  const buf = new ArrayBuffer(sizeBytes)
  return new File([buf], 'test.jpg', { type: 'image/jpeg' })
}

function mockBitmap(width: number, height: number): ImageBitmap {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Default: createImageBitmap returns a 1920×1080 bitmap
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn().mockResolvedValue(mockBitmap(1920, 1080)),
  )

  // OffscreenCanvas: return sharp pixel data (high variance) by default
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      getContext() {
        return {
          drawImage: vi.fn(),
          getImageData: () => ({
            // Alternating 0/255 pixels → very high Laplacian variance
            data: new Uint8ClampedArray(256 * 256 * 4).map((_, i) =>
              i % 8 < 4 ? 255 : 0,
            ),
          }),
        }
      }
    },
  )
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkImageQuality', () => {
  it('rejects images below minimum resolution', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(320, 240)),
    )
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(false)
    expect(result.errorKey).toBe('report.photo.error_resolution')
  })

  it('rejects blurry images (uniform/flat pixel data = zero variance)', async () => {
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return {
            drawImage: vi.fn(),
            // All pixels identical → zero Laplacian variance
            getImageData: () => ({ data: new Uint8ClampedArray(256 * 256 * 4).fill(128) }),
          }
        }
      },
    )
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(false)
    expect(result.errorKey).toBe('report.photo.error_blur')
  })

  it('accepts a valid, sharp image', async () => {
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(true)
    expect(result.errorKey).toBeUndefined()
  })

  it('rejects exactly at minimum resolution boundary', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(IMAGE_MIN_WIDTH - 1, IMAGE_MIN_HEIGHT)),
    )
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(false)
  })

  it('accepts exactly at minimum resolution boundary', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(IMAGE_MIN_WIDTH, IMAGE_MIN_HEIGHT)),
    )
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(true)
  })

  it('returns a user-friendly reason on createImageBitmap failure', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode error')))
    const result = await checkImageQuality(makeFile(1024))
    expect(result.ok).toBe(false)
    expect(result.errorKey).toBe('report.photo.error_generic')
  })
})
