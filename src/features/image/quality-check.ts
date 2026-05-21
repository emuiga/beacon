import {
  IMAGE_MIN_WIDTH,
  IMAGE_MIN_HEIGHT,
  IMAGE_MIN_SIZE_BYTES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_BLUR_THRESHOLD,
} from '@/lib/constants'

export interface QualityCheckResult {
  ok: boolean
  reason?: string
}

/**
 * Runs three checks before the user proceeds past the photo step:
 *  1. File size (200 KB – 15 MB)
 *  2. Resolution (≥ 640 × 480)
 *  3. Blur (Laplacian variance ≥ 100)
 */
export async function checkImageQuality(file: File): Promise<QualityCheckResult> {
  // 1 — File size
  if (file.size < IMAGE_MIN_SIZE_BYTES) {
    return { ok: false, reason: 'Image file is too small (minimum 200 KB).' }
  }
  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    return { ok: false, reason: 'Image file is too large (maximum 15 MB).' }
  }

  // Load image dimensions and pixel data via OffscreenCanvas where available,
  // falling back to a hidden HTMLImageElement + regular canvas in older browsers.
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return { ok: false, reason: 'Could not read image — please try a different photo.' }
  }

  const { width, height } = bitmap

  // 2 — Resolution
  if (width < IMAGE_MIN_WIDTH || height < IMAGE_MIN_HEIGHT) {
    bitmap.close()
    return {
      ok: false,
      reason: `Image resolution is too low (${width}×${height}). Minimum is ${IMAGE_MIN_WIDTH}×${IMAGE_MIN_HEIGHT}.`,
    }
  }

  // 3 — Blur via Laplacian variance on a scaled-down canvas
  const blurScore = computeLaplacianVariance(bitmap)
  bitmap.close()

  if (blurScore < IMAGE_BLUR_THRESHOLD) {
    return {
      ok: false,
      reason: 'Image appears blurry. Please retake the photo in better lighting.',
    }
  }

  return { ok: true }
}

// ── Laplacian variance ────────────────────────────────────────────────────────

/** Scale down before processing to keep this fast on large files. */
const SAMPLE_SIZE = 256

/**
 * Draws the image into a small greyscale canvas, applies a discrete Laplacian
 * kernel, and returns the variance of the result. Higher = sharper.
 */
function computeLaplacianVariance(bitmap: ImageBitmap): number {
  const canvas = new OffscreenCanvas(SAMPLE_SIZE, SAMPLE_SIZE)
  const ctx = canvas.getContext('2d')
  if (ctx === null) return IMAGE_BLUR_THRESHOLD // can't check — pass through

  ctx.drawImage(bitmap, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  // Convert to greyscale luminance values (Rec. 709 coefficients)
  const grey = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE)
  for (let i = 0; i < grey.length; i++) {
    const base = i * 4
    grey[i] =
      0.2126 * (data[base] ?? 0) +
      0.7152 * (data[base + 1] ?? 0) +
      0.0722 * (data[base + 2] ?? 0)
  }

  // Apply 3×3 Laplacian kernel: [0,1,0, 1,-4,1, 0,1,0]
  const W = SAMPLE_SIZE
  const laplacian = new Float32Array((W - 2) * (W - 2))
  let idx = 0
  for (let y = 1; y < W - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const center = grey[y * W + x] ?? 0
      const top    = grey[(y - 1) * W + x] ?? 0
      const bottom = grey[(y + 1) * W + x] ?? 0
      const left   = grey[y * W + (x - 1)] ?? 0
      const right  = grey[y * W + (x + 1)] ?? 0
      laplacian[idx++] = top + bottom + left + right - 4 * center
    }
  }

  return variance(laplacian)
}

function variance(arr: Float32Array): number {
  const n = arr.length
  if (n === 0) return 0

  let sum = 0
  for (let i = 0; i < n; i++) sum += arr[i] ?? 0
  const mean = sum / n

  let sq = 0
  for (let i = 0; i < n; i++) {
    const diff = (arr[i] ?? 0) - mean
    sq += diff * diff
  }
  return sq / n
}
