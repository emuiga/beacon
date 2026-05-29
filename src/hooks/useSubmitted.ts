'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAllSubmitted, type SubmittedItem } from '@/features/offline/submitted'
import { logger } from '@/lib/logger'

export type { SubmittedItem }

interface UseSubmittedReturn {
  submitted: SubmittedItem[]
  loading: boolean
  refresh: () => Promise<void>
}

export function useSubmitted(): UseSubmittedReturn {
  const [submitted, setSubmitted] = useState<SubmittedItem[]>([])
  const [loading,   setLoading]   = useState(true)

  const refresh = useCallback(async () => {
    try {
      const all = await getAllSubmitted()
      setSubmitted(all)
    } catch (err) {
      logger.error('useSubmitted: load failed', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
  }, [refresh])

  return { submitted, loading, refresh }
}
