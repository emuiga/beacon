import { gps } from 'exifr'
import { logger } from '@/lib/logger'

export interface ExifGps {
  latitude: number
  longitude: number
}

/**
 * Attempts to extract GPS coordinates from a photo's EXIF data.
 * Returns null if no GPS data is present or if extraction fails.
 *
 * Call this before prompting the user for manual location — many field
 * photos will already have embedded coordinates.
 */
export async function extractGpsFromExif(file: File): Promise<ExifGps | null> {
  try {
    const result = await gps(file)

    if (
      result === undefined ||
      result === null ||
      typeof result.latitude !== 'number' ||
      typeof result.longitude !== 'number' ||
      !isFinite(result.latitude) ||
      !isFinite(result.longitude)
    ) {
      return null
    }

    logger.debug('exif: GPS found', {
      lat: result.latitude,
      lng: result.longitude,
    })

    return { latitude: result.latitude, longitude: result.longitude }
  } catch (err) {
    // Not an error — many photos simply have no EXIF GPS
    logger.debug('exif: no GPS data', { err })
    return null
  }
}
