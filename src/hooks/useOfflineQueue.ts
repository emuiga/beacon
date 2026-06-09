'use client'

import { useState, useEffect, useCallback } from 'react'
import { useConnectivity } from './useConnectivity'
import {
  getAllQueued,
  enqueue,
  pendingCount,
  type QueueItem,
} from '@/features/offline/queue'
import { syncQueue, scheduleRetry } from '@/features/offline/sync'
import { logger } from '@/lib/logger'

interface OfflineQueueState {
  items: QueueItem[]
  pending: number
  syncing: boolean
}

interface UseOfflineQueueReturn extends OfflineQueueState {
  /** Add a new item to the queue (call this instead of enqueue directly). */
  addToQueue: (item: QueueItem) => Promise<void>
  /** Manually trigger a sync attempt. */
  triggerSync: () => Promise<void>
  /** Refresh the local queue snapshot. */
  refresh: () => Promise<void>
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const { online } = useConnectivity()

  const [state, setState] = useState<OfflineQueueState>({
    items: [],
    pending: 0,
    syncing: false,
  })

  const refresh = useCallback(async () => {
    const [items, pending] = await Promise.all([getAllQueued(), pendingCount()])
    setState((prev) => ({ ...prev, items, pending }))
  }, [])

  // Load queue on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch((err) => logger.error('useOfflineQueue: refresh failed', err))
  }, [refresh])

  // Auto-sync when connectivity is restored
  useEffect(() => {
    if (!online) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, syncing: true }))

    syncQueue()
      .then(() => refresh())
      .catch((err) => logger.error('useOfflineQueue: sync failed', err))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      .finally(() => setState((prev) => ({ ...prev, syncing: false })))
  }, [online, refresh])

  const addToQueue = useCallback(
    async (item: QueueItem) => {
      await enqueue(item)
      await refresh()

      // If we're online, attempt immediate sync; otherwise schedule retry
      if (online) {
        setState((prev) => ({ ...prev, syncing: true }))
        try {
          await syncQueue()
        } catch (err) {
          logger.warn('useOfflineQueue: immediate sync failed', err)
          scheduleRetry(item)
        } finally {
          setState((prev) => ({ ...prev, syncing: false }))
          await refresh()
        }
      }
    },
    [online, refresh],
  )

  const triggerSync = useCallback(async () => {
    if (!online) return
    setState((prev) => ({ ...prev, syncing: true }))
    try {
      await syncQueue()
      await refresh()
    } finally {
      setState((prev) => ({ ...prev, syncing: false }))
    }
  }, [online, refresh])

  return { ...state, addToQueue, triggerSync, refresh }
}
