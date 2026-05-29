'use client'

import { CloudOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import '@/lib/i18n'

/**
 * Compact badge showing the number of reports pending sync.
 * Renders nothing when the queue is empty.
 */
export function SyncQueue() {
  const { t } = useTranslation()
  const { pending } = useOfflineQueue()

  if (pending === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium"
      title={t('offline.pending', { count: pending })}
    >
      <CloudOff className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{pending}</span>
    </div>
  )
}
