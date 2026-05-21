import imageCompression from 'browser-image-compression'
import { logger } from '@/lib/logger'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const

/**
 * Compresses a photo client-side to ≤ 1 MB before upload.
 * Preserves the original File name and MIME type.
 * Throws if compression fails — callers should handle and surface via toast.
 */
export async function compressPhoto(file: File): Promise<File> {
  // Already within budget — skip compression
  if (file.size <= COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
    logger.debug('compress: file already within budget, skipping', {
      name: file.name,
      size: file.size,
    })
    return file
  }

  logger.debug('compress: compressing photo', {
    name: file.name,
    originalSize: file.size,
  })

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS)

  logger.debug('compress: done', {
    name: file.name,
    originalSize: file.size,
    compressedSize: compressed.size,
    ratio: ((1 - compressed.size / file.size) * 100).toFixed(1) + '%',
  })

  return compressed
}
