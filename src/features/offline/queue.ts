import { getDB, type QueueItem, type QueueItemStatus } from './db'
import { logger } from '@/lib/logger'

export type { QueueItem, QueueItemStatus }

const STORE = 'queue' as const

export async function enqueue(item: QueueItem): Promise<void> {
  const db = await getDB()
  await db.put(STORE, item)
  logger.debug('queue: enqueued', { id: item.id })
}

export async function getAllQueued(): Promise<QueueItem[]> {
  const db = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => a.created_at - b.created_at)
}

export async function getByStatus(status: QueueItemStatus): Promise<QueueItem[]> {
  const all = await getAllQueued()
  return all.filter((item) => item.status === status)
}

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

export async function dequeue(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
  logger.debug('queue: dequeued', { id })
}

export async function pendingCount(): Promise<number> {
  const all = await getAllQueued()
  return all.filter((i) => i.status === 'pending' || i.status === 'failed').length
}

export async function clearQueue(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE)
}
