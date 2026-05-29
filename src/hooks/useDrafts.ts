'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllDrafts, deleteDraft, type DraftItem } from '@/features/offline/drafts'
import { logger } from '@/lib/logger'

export type { DraftItem }

interface UseDraftsReturn {
  drafts: DraftItem[]
  loading: boolean
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useDrafts(): UseDraftsReturn {
  const [drafts,  setDrafts]  = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const all = await getAllDrafts()
      setDrafts(all)
    } catch (err) {
      logger.error('useDrafts: load failed', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await deleteDraft(id)
    await refresh()
  }, [refresh])

  return { drafts, loading, remove, refresh }
}
