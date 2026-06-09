import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncQueue, scheduleRetry, cancelRetry } from '../sync'
import type { QueueItem } from '../queue'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  api: {
    post:      vi.fn(),
    patch:     vi.fn(),
    postForm:  vi.fn(),
    patchForm: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('../connectivity', () => ({
  isOnline: vi.fn().mockReturnValue(true),
}))

const mockQueue: QueueItem[] = []

vi.mock('../queue', () => ({
  getAllQueued: vi.fn().mockImplementation(() => Promise.resolve([...mockQueue])),
  updateItem:  vi.fn().mockResolvedValue(undefined),
  dequeue:     vi.fn().mockResolvedValue(undefined),
}))

import { api } from '@/lib/api'
import { isOnline } from '../connectivity'
import { updateItem, dequeue } from '../queue'

const mockPost      = vi.mocked(api.post)
const mockPatch     = vi.mocked(api.patch)
const mockPostForm  = vi.mocked(api.postForm)
const mockPatchForm = vi.mocked(api.patchForm)
const mockIsOnline = vi.mocked(isOnline)
const mockUpdate   = vi.mocked(updateItem)
const mockDequeue  = vi.mocked(dequeue)

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(id: string, attempts = 0, status: QueueItem['status'] = 'pending'): QueueItem {
  return {
    id,
    status,
    attempts,
    created_at: Date.now(),
    metadata: {
      crisis_type: 'flood',
      infrastructure_type: 'residential',
      damage_severity: 'partial',
    },
    photo_blob: new Blob(['img']),
    photo_preview_url: 'blob:x',
  }
}

beforeEach(() => {
  mockQueue.length = 0
  vi.clearAllMocks()
  mockIsOnline.mockReturnValue(true)
})

afterEach(() => {
  cancelRetry()
  vi.useRealTimers()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('syncQueue', () => {
  it('does nothing when offline', async () => {
    mockIsOnline.mockReturnValue(false)
    mockQueue.push(makeItem('a'))
    await syncQueue()
    expect(mockPostForm).not.toHaveBeenCalled()
  })

  it('does nothing when queue is empty', async () => {
    await syncQueue()
    expect(mockPostForm).not.toHaveBeenCalled()
  })

  it('syncs a pending item successfully', async () => {
    mockQueue.push(makeItem('item1'))
    mockPostForm.mockResolvedValue({ id: 'server-1' })
    mockPatchForm.mockResolvedValue({})

    await syncQueue()

    expect(mockPostForm).toHaveBeenCalledOnce()
    expect(mockPatchForm).toHaveBeenCalledWith('/reports/server-1/photo', expect.any(FormData))
    expect(mockDequeue).toHaveBeenCalledWith('item1')
  })

  it('marks item as failed when POST throws', async () => {
    mockQueue.push(makeItem('item2'))
    mockPostForm.mockRejectedValue(new Error('network error'))

    await syncQueue()

    expect(mockUpdate).toHaveBeenCalledWith('item2', { status: 'failed' })
    expect(mockDequeue).not.toHaveBeenCalled()
  })

  it('skips items that have reached MAX_ATTEMPTS (5)', async () => {
    mockQueue.push(makeItem('old', 5, 'failed'))
    await syncQueue()
    expect(mockPostForm).not.toHaveBeenCalled()
    expect(mockUpdate).toHaveBeenCalledWith('old', { status: 'failed' })
  })

  it('syncs multiple items in sequence', async () => {
    mockQueue.push(makeItem('a'), makeItem('b'))
    mockPostForm.mockResolvedValue({ id: 'srv' })
    mockPatchForm.mockResolvedValue({})

    await syncQueue()

    expect(mockPostForm).toHaveBeenCalledTimes(2)
    expect(mockDequeue).toHaveBeenCalledTimes(2)
  })

  it('stops mid-queue if connectivity is lost', async () => {
    mockQueue.push(makeItem('a'), makeItem('b'))

    let callCount = 0
    mockPostForm.mockImplementation(async () => {
      callCount++
      if (callCount === 1) mockIsOnline.mockReturnValue(false)
      return { id: 'srv' }
    })
    mockPatchForm.mockResolvedValue({})

    await syncQueue()

    // Only first item fully processed; second skipped due to offline check
    expect(mockPostForm).toHaveBeenCalledTimes(1)
  })
})

describe('scheduleRetry', () => {
  it('resets status to pending and triggers sync after backoff', async () => {
    vi.useFakeTimers()
    const item = makeItem('r1', 1, 'failed')
    mockQueue.push(item)
    mockPostForm.mockResolvedValue({ id: 'srv' })
    mockPatchForm.mockResolvedValue({})

    scheduleRetry(item)
    expect(mockUpdate).not.toHaveBeenCalled()

    await vi.runAllTimersAsync()

    expect(mockUpdate).toHaveBeenCalledWith('r1', { status: 'pending' })
  })
})
