'use client'

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Upload, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { checkImageQuality } from '@/features/image/quality-check'
import { compressPhoto } from '@/features/image/compress'
import { extractGpsFromExif } from '@/features/image/exif'
import { logger } from '@/lib/logger'
import '@/lib/i18n'

export function PhotoStep() {
  const { t } = useTranslation()
  const { draft, setField } = useReportDraftStore()
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const previewUrl = draft.photo ? URL.createObjectURL(draft.photo) : null

  async function handleFile(file: File) {
    setErrorKey(null)
    setProcessing(true)
    try {
      const quality = await checkImageQuality(file)
      if (!quality.ok) {
        setErrorKey(quality.errorKey ?? 'report.photo.error_generic')
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
      setErrorKey('report.photo.error_generic')
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
        <h2 className="text-xl font-semibold mb-1">{t('report.photo.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('report.photo.description')}</p>
      </div>

      {/* Preview */}
      {previewUrl !== null && (
        <div className="relative rounded-xl overflow-hidden border bg-muted aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={t('report.photo.title')}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => { setField('photo', null); setErrorKey(null) }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
            aria-label={t('report.photo.retake')}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Error */}
      {errorKey !== null && (
        <div role="alert" className="flex items-start gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{t(errorKey)}</span>
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
            {processing ? t('common.loading') : t('report.photo.take_photo')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 text-base gap-2"
            disabled={processing}
            onClick={() => galleryRef.current?.click()}
          >
            <Upload className="h-5 w-5" aria-hidden="true" />
            {t('report.photo.upload_photo')}
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
        aria-label={t('report.photo.take_photo')}
        onChange={onInputChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={t('report.photo.upload_photo')}
        onChange={onInputChange}
      />

      {draft.photo !== null && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => cameraRef.current?.click()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t('report.photo.retake')}
        </Button>
      )}
    </div>
  )
}
