'use client'

import { useMutation } from '@tanstack/react-query'
import { api, NetworkError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { logger } from '@/lib/logger'
import type {
  ReportMetadata,
  ReportCreateResponse,
  ReportPhotoResponse,
} from '@/types/api'

export interface SubmitReportArgs {
  metadata: ReportMetadata
  photo: File | null
}

export interface SubmitReportResult {
  id: string
  photo_url: string | null
}

async function submitReport(args: SubmitReportArgs): Promise<SubmitReportResult> {
  const { metadata, photo } = args

  // Step 1 — POST metadata (+ optional photo in same request)
  const form = new FormData()
  form.append('metadata', JSON.stringify(metadata))
  if (photo !== null) {
    form.append('photo', photo, photo.name)
  }

  const created = await api.postForm<ReportCreateResponse>('/reports', form)

  // Step 2 — PATCH photo separately if we didn't include it above
  // (only needed for offline-queued reports that were submitted without photo)
  // For online flow the photo is already included in step 1.
  logger.info('Report created', { id: created.id, status: created.status })

  return { id: created.id, photo_url: null }
}

export function useReportSubmit() {
  const { sessionToken } = useAuthStore()

  return useMutation({
    mutationFn: async (args: SubmitReportArgs): Promise<SubmitReportResult> => {
      if (sessionToken === null) {
        throw new Error('No session token — call POST /auth/anonymous first')
      }
      return submitReport(args)
    },
    onError: (err) => {
      if (err instanceof NetworkError) {
        // Caller should handle offline queuing
        return
      }
      logger.error('Report submit failed', err)
    },
  })
}

// Upload a photo to an existing report (used for deferred offline uploads)
export async function uploadReportPhoto(
  reportId: string,
  photo: File | Blob,
): Promise<ReportPhotoResponse> {
  const form = new FormData()
  form.append('photo', photo, 'photo.jpg')
  return api.patchForm<ReportPhotoResponse>(`/reports/${reportId}/photo`, form)
}
