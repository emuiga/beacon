import imageCompression from 'browser-image-compression'
import { getDB, type DraftItem } from './db'
import { logger } from '@/lib/logger'

export type { DraftItem }

const STORE     = 'drafts' as const
const MAX_DRAFTS = 10

// Generate an 80×80 square crop thumbnail using canvas.
// Canvas is GPU-accelerated even on low-end Android — much cheaper than
// loading the full image into JS memory just for display.
async function makeThumbnail(blob: Blob): Promise<Blob | null> {
  try {
    const url = URL.createObjectURL(blob)
    const img  = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    URL.revokeObjectURL(url)

    const SIZE   = 80
    const canvas = document.createElement('canvas')
    canvas.width  = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')
    if (ctx === null) return null

    // Centre-crop so the thumbnail is always square regardless of orientation
    const min = Math.min(img.naturalWidth, img.naturalHeight)
    const sx  = (img.naturalWidth  - min) / 2
    const sy  = (img.naturalHeight - min) / 2
    ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.75),
    )
  } catch (err) {
    logger.warn('drafts: thumbnail generation failed', err)
    return null
  }
}

// Compress a photo Blob to ≤500 KB for IndexedDB storage.
// This is separate from the ≤1 MB upload compression so drafts take less space.
// On a low-end device with limited storage this matters a lot.
async function compressForStorage(file: File | Blob): Promise<Blob> {
  try {
    const asFile = file instanceof File ? file : new File([file], 'photo.jpg', { type: 'image/jpeg' })
    return await imageCompression(asFile, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,   // off-main-thread — keeps UI responsive on slow devices
    })
  } catch (err) {
    logger.warn('drafts: compression failed, storing original', err)
    return file
  }
}

export async function saveDraft(draft: Omit<DraftItem, 'photo_thumb'>): Promise<void> {
  const db   = await getDB()
  const all  = await db.getAll(STORE)

  if (all.length >= MAX_DRAFTS) {
    throw new Error(`DRAFT_LIMIT: maximum ${MAX_DRAFTS} drafts allowed`)
  }

  // Compress and thumbnail generation run in parallel
  const [compressed, thumb] = await Promise.all([
    draft.photo_blob !== null ? compressForStorage(draft.photo_blob) : Promise.resolve(null),
    draft.photo_blob !== null ? makeThumbnail(draft.photo_blob)      : Promise.resolve(null),
  ])

  const item: DraftItem = {
    ...draft,
    photo_blob:  compressed,
    photo_thumb: thumb,
    updated_at:  Date.now(),
  }

  await db.put(STORE, item)
  logger.debug('drafts: saved', { id: draft.id })
}

export async function getAllDrafts(): Promise<DraftItem[]> {
  const db  = await getDB()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => b.updated_at - a.updated_at)   // newest first
}

export async function getDraft(id: string): Promise<DraftItem | undefined> {
  const db = await getDB()
  return db.get(STORE, id)
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
  logger.debug('drafts: deleted', { id })
}

export async function draftCount(): Promise<number> {
  const db  = await getDB()
  const all = await db.getAll(STORE)
  return all.length
}
