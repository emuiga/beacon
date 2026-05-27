import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enqueue,
  getAllQueued,
  getByStatus,
  updateItem,
  dequeue,
  pendingCount,
  clearQueue,
  type QueueItem,
} from '../queue'

// ── idb mock ──────────────────────────────────────────────────────────────────

const store = new Map<string, QueueItem>()

vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    put:    (_: string, item: QueueItem) => { store.set(item.id, item); return Promise.resolve() },
    get:    (_: string, id: string)      => Promise.resolve(store.get(id)),
    getAll: (_: string)                  => Promise.resolve([...store.values()]),
    delete: (_: string, id: string)      => { store.delete(id); return Promise.resolve() },
    clear:  (_: string)                  => { store.clear(); return Promise.resolve() },
    objectStoreNames: { contains: () => true },
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(id: string, status: QueueItem['status'] = 'pending', created_at = Date.now()): QueueItem {
  return {
    id,
    status,
    attempts: 0,
    created_at,
    metadata: {
      crisis_type: 'flood',
      infrastructure_type: 'residential',
      damage_severity: 'partial',
      electricity_status: null,
      health_services_status: null,
      debris_clearing_needed: false,
      session_token: 'test-token',
    },
    photo_blob: new Blob(['img'], { type: 'image/jpeg' }),
    photo_preview_url: 'blob:test',
  }
}

beforeEach(() => store.clear())

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('enqueue / getAllQueued', () => {
  it('stores an item and retrieves it', async () => {
    const item = makeItem('abc')
    await enqueue(item)
    const all = await getAllQueued()
    expect(all).toHaveLength(1)
    expect(all[0]?.id).toBe('abc')
  })

  it('returns items sorted by created_at ascending', async () => {
    await enqueue(makeItem('b', 'pending', 200))
    await enqueue(makeItem('a', 'pending', 100))
    const all = await getAllQueued()
    expect(all.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('getByStatus', () => {
  it('filters by status correctly', async () => {
    await enqueue(makeItem('p1', 'pending'))
    await enqueue(makeItem('f1', 'failed'))
    await enqueue(makeItem('s1', 'syncing'))

    const pending = await getByStatus('pending')
    expect(pending.map((i) => i.id)).toEqual(['p1'])

    const failed = await getByStatus('failed')
    expect(failed.map((i) => i.id)).toEqual(['f1'])
  })
})

describe('updateItem', () => {
  it('updates status and attempts', async () => {
    await enqueue(makeItem('x'))
    await updateItem('x', { status: 'syncing', attempts: 1 })
    const all = await getAllQueued()
    expect(all[0]?.status).toBe('syncing')
    expect(all[0]?.attempts).toBe(1)
  })

  it('does nothing silently when id is not found', async () => {
    await expect(updateItem('missing', { status: 'failed' })).resolves.toBeUndefined()
  })
})

describe('dequeue', () => {
  it('removes an item by id', async () => {
    await enqueue(makeItem('del'))
    await dequeue('del')
    const all = await getAllQueued()
    expect(all).toHaveLength(0)
  })
})

describe('pendingCount', () => {
  it('counts pending and failed items only', async () => {
    await enqueue(makeItem('p', 'pending'))
    await enqueue(makeItem('f', 'failed'))
    await enqueue(makeItem('s', 'syncing'))
    expect(await pendingCount()).toBe(2)
  })
})

describe('clearQueue', () => {
  it('removes all items', async () => {
    await enqueue(makeItem('1'))
    await enqueue(makeItem('2'))
    await clearQueue()
    expect(await getAllQueued()).toHaveLength(0)
  })
})
