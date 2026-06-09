import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { ReportMetadata } from '@/types/api'
import { logger } from '@/lib/logger'

// ── Schema ────────────────────────────────────────────────────────────────────

export type QueueItemStatus = 'pending' | 'syncing' | 'failed'

export interface QueueItem {
  id: string
  status: QueueItemStatus
  attempts: number
  created_at: number
  metadata: ReportMetadata
  photo_blob: Blob
  photo_preview_url: string
}

interface BeaconDB extends DBSchema {
  queue: {
    key: string
    value: QueueItem
  }
}

const DB_NAME    = 'crisismap-offline'
const DB_VERSION = 1
const STORE      = 'queue' as const

// ── Connection ────────────────────────────────────────────────────────────────

let _db: IDBPDatabase<BeaconDB> | null = null

async function getDB(): Promise<IDBPDatabase<BeaconDB>> {
  if (_db !== null) return _db

  _db = await openDB<BeaconDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    },
  })

  return _db
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Add a new report to the offline queue. */
export async function enqueue(item: QueueItem): Promise<void> {
  const db = await getDB()
  await db.put(STORE, item)
  logger.debug('queue: enqueued', { id: item.id })
}

/** Return all items in the queue, ordered by creation time (oldest first). */
export async function getAllQueued(): Promise<QueueItem[]> {
  const db = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => a.created_at - b.created_at)
}

/** Return only items with a given status. */
export async function getByStatus(status: QueueItemStatus): Promise<QueueItem[]> {
  const all = await getAllQueued()
  return all.filter((item) => item.status === status)
}

/** Update the status (and optionally attempts) of a queued item. */
export async function updateItem(
  id: string,
  patch: Partial<Pick<QueueItem, 'status' | 'attempts'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get(STORE, id)
  if (existing === undefined) {
    logger.warn('queue: updateItem — id not found', { id })
    return
  }
  await db.put(STORE, { ...existing, ...patch })
}

/** Remove a successfully synced item. */
export async function dequeue(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
  logger.debug('queue: dequeued', { id })
}

/** Count of all pending + failed items (displayed in the header). */
export async function pendingCount(): Promise<number> {
  const all = await getAllQueued()
  return all.filter((i) => i.status === 'pending' || i.status === 'failed').length
}

/** Wipe the entire queue — used in tests and during logout. */
export async function clearQueue(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE)
}
