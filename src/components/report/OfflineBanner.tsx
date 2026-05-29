'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export function OfflineBanner() {
  const { online, hydrating } = useConnectivity()
  const { pending, syncing, triggerSync } = useOfflineQueue()
  const { t } = useTranslation()

  // While hydrating, assume online — prevents flicker on first render
  if (hydrating) return null

  if (online) {
    if (pending === 0) return null
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-sm text-blue-800">
        <span>
          {syncing
            ? t('report.offline.syncing', { count: pending })
            : t('report.offline.queue_count', { count: pending })}
        </span>
        {!syncing && (
          <button
            onClick={() => { void triggerSync() }}
            className="flex items-center gap-1 font-medium underline underline-offset-2"
            aria-label={t('common.retry')}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t('report.offline.retry')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center gap-2 text-sm text-amber-900"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>{t('report.offline.offline_mode')}</strong> — {t('report.offline.offline_description')}
        {pending > 0 && ` (${pending} queued)`}
      </span>
    </div>
  )
}
