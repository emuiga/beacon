import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkImageQuality } from '../quality-check'
import {
  IMAGE_MIN_SIZE_BYTES,
  IMAGE_MAX_SIZE_BYTES,
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
  it('rejects files below minimum size', async () => {
    const result = await checkImageQuality(makeFile(IMAGE_MIN_SIZE_BYTES - 1))
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/too small/i)
  })

  it('rejects files above maximum size', async () => {
    const result = await checkImageQuality(makeFile(IMAGE_MAX_SIZE_BYTES + 1))
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/too large/i)
  })

  it('rejects images below minimum resolution', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(320, 240)),
    )
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/resolution.*too low/i)
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
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/blurry/i)
  })

  it('accepts a valid, sharp, correctly-sized image', async () => {
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('rejects exactly at minimum resolution boundary', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(IMAGE_MIN_WIDTH - 1, IMAGE_MIN_HEIGHT)),
    )
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(false)
  })

  it('accepts exactly at minimum resolution boundary', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(mockBitmap(IMAGE_MIN_WIDTH, IMAGE_MIN_HEIGHT)),
    )
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(true)
  })

  it('returns a user-friendly reason on createImageBitmap failure', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode error')))
    const file = makeFile(IMAGE_MIN_SIZE_BYTES + 1)
    const result = await checkImageQuality(file)
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/could not read/i)
  })
})
