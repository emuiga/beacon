import { getDB, type SubmittedItem } from './db'
import { logger } from '@/lib/logger'

export type { SubmittedItem }

const STORE    = 'submitted' as const
const MAX_KEEP = 50   // oldest records are pruned beyond this

export async function saveSubmitted(item: SubmittedItem): Promise<void> {
  const db = await getDB()
  await db.put(STORE, item)

  // Prune oldest records to cap storage usage on low-end devices
  const all = (await db.getAll(STORE)).sort((a, b) => a.submitted_at - b.submitted_at)
  if (all.length > MAX_KEEP) {
    const toDelete = all.slice(0, all.length - MAX_KEEP)
    await Promise.all(toDelete.map((r) => db.delete(STORE, r.id)))
  }

  logger.debug('submitted: saved', { id: item.id })
}

export async function getAllSubmitted(): Promise<SubmittedItem[]> {
  const db  = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => b.submitted_at - a.submitted_at)   // newest first
}

// Called by the sync engine when backend confirms a status change
export async function updateSubmittedStatus(
  localId: string,
  status: SubmittedItem['status'],
): Promise<void> {
  const db  = await getDB()
  const all = await db.getAll(STORE)
  const item = all.find((r) => r.local_id === localId)
  if (item === undefined) return
  await db.put(STORE, { ...item, status })
}
