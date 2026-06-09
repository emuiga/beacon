import { api } from '@/lib/api'
import { logger } from '@/lib/logger'
import { isOnline } from './connectivity'
import {
  getAllQueued,
  updateItem,
  dequeue,
  type QueueItem,
} from './queue'

// ── Config ────────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 5

/** Exponential backoff: 2s, 4s, 8s, 16s, 32s */
function backoffMs(attempt: number): number {
  return Math.min(2 ** attempt * 1000, 32_000)
}

// ── Response types ────────────────────────────────────────────────────────────

interface ReportCreateResponse {
  id: string
}

// ── Core sync logic ───────────────────────────────────────────────────────────

/**
 * Attempt to sync a single queue item.
 *
 * Two-phase upload per CLAUDE.md:
 *   1. POST /reports  (metadata + placeholder photo)
 *   2. PATCH /reports/:id/photo  (actual blob)
 */
async function syncItem(item: QueueItem): Promise<void> {
  if (item.attempts >= MAX_ATTEMPTS) {
    logger.warn('sync: max attempts reached, giving up', { id: item.id })
    await updateItem(item.id, { status: 'failed' })
    return
  }

  await updateItem(item.id, { status: 'syncing', attempts: item.attempts + 1 })

  try {
    // Phase 1: submit metadata as JSON string in multipart form
    const body = new FormData()
    body.append('metadata', JSON.stringify(item.metadata))

    const { id: serverId } = await api.postForm<ReportCreateResponse>('/reports', body)

    // Phase 2: upload the real photo separately
    const photoForm = new FormData()
    photoForm.append('photo', item.photo_blob, 'photo.jpg')
    await api.patchForm(`/reports/${serverId}/photo`, photoForm)

    await dequeue(item.id)
    logger.info('sync: item synced', { localId: item.id, serverId })
  } catch (err) {
    logger.warn('sync: item failed', { id: item.id, attempt: item.attempts + 1, err })
    await updateItem(item.id, { status: 'failed' })
  }
}

/**
 * Process the entire queue sequentially.
 * Skips items already at max attempts.
 * Safe to call multiple times — already-syncing items are re-queued as pending.
 */
export async function syncQueue(): Promise<void> {
  if (!isOnline()) {
    logger.debug('sync: offline, skipping')
    return
  }

  const items = await getAllQueued()
  const syncable = items.filter(
    (i) => i.status === 'pending' || i.status === 'failed',
  )

  if (syncable.length === 0) {
    logger.debug('sync: nothing to sync')
    return
  }

  logger.info('sync: starting', { count: syncable.length })

  for (const item of syncable) {
    if (!isOnline()) {
      logger.debug('sync: went offline mid-sync, stopping')
      break
    }
    await syncItem(item)
  }

  logger.info('sync: pass complete')
}

// ── Retry scheduler ───────────────────────────────────────────────────────────

let _retryTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Schedule a retry for a failed item using exponential backoff.
 * Resets the item status to 'pending' so syncQueue will pick it up.
 */
export function scheduleRetry(item: QueueItem): void {
  const delay = backoffMs(item.attempts)
  logger.debug('sync: scheduling retry', { id: item.id, delayMs: delay })

  _retryTimer = setTimeout(async () => {
    await updateItem(item.id, { status: 'pending' })
    await syncQueue()
  }, delay)
}

/** Cancel any pending retry timer — call on unmount / logout. */
export function cancelRetry(): void {
  if (_retryTimer !== null) {
    clearTimeout(_retryTimer)
    _retryTimer = null
  }
}
