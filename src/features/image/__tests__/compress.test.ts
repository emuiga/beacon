import { describe, it, expect, vi } from 'vitest'
import { compressPhoto } from '../compress'

vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

import imageCompression from 'browser-image-compression'
const mockCompress = vi.mocked(imageCompression)

const ONE_MB = 1024 * 1024

function makeFile(sizeBytes: number, name = 'photo.jpg'): File {
  return new File([new ArrayBuffer(sizeBytes)], name, { type: 'image/jpeg' })
}

describe('compressPhoto', () => {
  it('skips compression when file is already within 1 MB', async () => {
    const file = makeFile(ONE_MB - 1)
    const result = await compressPhoto(file)
    expect(result).toBe(file)
    expect(mockCompress).not.toHaveBeenCalled()
  })

  it('calls imageCompression when file exceeds 1 MB', async () => {
    const original = makeFile(ONE_MB + 1)
    const compressed = makeFile(500_000, 'photo.jpg')
    mockCompress.mockResolvedValue(compressed)

    const result = await compressPhoto(original)

    expect(mockCompress).toHaveBeenCalledWith(original, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    })
    expect(result).toBe(compressed)
  })

  it('propagates errors from imageCompression', async () => {
    const file = makeFile(ONE_MB + 1)
    mockCompress.mockRejectedValue(new Error('Worker failed'))
    await expect(compressPhoto(file)).rejects.toThrow('Worker failed')
  })
})
