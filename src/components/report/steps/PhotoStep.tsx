'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { checkImageQuality } from '@/features/image/quality-check'
import { compressPhoto } from '@/features/image/compress'
import { extractGpsFromExif } from '@/features/image/exif'
import { logger } from '@/lib/logger'

export function PhotoStep() {
  const { draft, setField } = useReportDraftStore()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const previewUrl = draft.photo ? URL.createObjectURL(draft.photo) : null

  async function handleFile(file: File) {
    setError(null)
    setProcessing(true)
    try {
      const quality = await checkImageQuality(file)
      if (!quality.ok) {
        setError(quality.reason ?? 'Image quality check failed. Please try again.')
        return
      }

      // Try to extract GPS from EXIF before compressing (compression strips EXIF)
      const exifGps = await extractGpsFromExif(file)
      if (exifGps !== null) {
        setField('lat', exifGps.latitude)
        setField('lng', exifGps.longitude)
        logger.debug('PhotoStep: GPS from EXIF', exifGps)
      }

      const compressed = await compressPhoto(file)
      setField('photo', compressed)
    } catch (err) {
      logger.warn('PhotoStep: processing failed', err)
      setError('Could not process image. Please try a different photo.')
    } finally {
      setProcessing(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file !== undefined) void handleFile(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Take a photo</h2>
        <p className="text-muted-foreground text-sm">
          Photograph the damaged structure. Min 640×480px, max 15 MB.
        </p>
      </div>

      {/* Preview */}
      {previewUrl !== null && (
        <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected photo preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => { setField('photo', null); setError(null) }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
            aria-label="Remove photo"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Error */}
      {error !== null && (
        <div role="alert" className="flex items-start gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload buttons */}
      {draft.photo === null && (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full h-14 text-base gap-2"
            disabled={processing}
            onClick={() => cameraRef.current?.click()}
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            {processing ? 'Processing…' : 'Take Photo'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base gap-2"
            disabled={processing}
            onClick={() => galleryRef.current?.click()}
          >
            <Upload className="h-5 w-5" aria-hidden="true" />
            Upload from Gallery
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Take photo with camera"
        onChange={onInputChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload photo from gallery"
        onChange={onInputChange}
      />

      {draft.photo !== null && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => cameraRef.current?.click()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retake Photo
        </Button>
      )}
    </div>
  )
}
