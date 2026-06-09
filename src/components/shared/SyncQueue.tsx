'use client'

import { RefreshCw } from 'lucide-react'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export function SyncQueue() {
  const { pending, syncing, triggerSync } = useOfflineQueue()

  if (pending === 0) return null

  return (
    <button
      onClick={() => { void triggerSync() }}
      disabled={syncing}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
      aria-label={`${pending} report${pending === 1 ? '' : 's'} pending sync — click to retry`}
    >
      <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span>{pending}</span>
    </button>
  )
}
