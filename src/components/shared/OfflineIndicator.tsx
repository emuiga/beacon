'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { t } = useTranslation()
  const { online, hydrating } = useConnectivity()
  const { pending, syncing } = useOfflineQueue()

  // Don't render anything while hydrating or when online with nothing pending
  if (hydrating) return null
  if (online && pending === 0 && !syncing) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium',
        online && (syncing || pending > 0)
          ? 'bg-blue-50 text-blue-800 border-b border-blue-200'
          : 'bg-amber-50 text-amber-800 border-b border-amber-200',
        className,
      )}
    >
      {!online ? (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t('offline.banner')}</span>
        </>
      ) : syncing ? (
        <>
          <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
          <span>{t('offline.syncing')}</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t('offline.pending', { count: pending })}</span>
        </>
      )}
    </div>
  )
}
