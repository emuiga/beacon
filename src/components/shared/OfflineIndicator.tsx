'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { cn } from '@/lib/utils'

export function OfflineIndicator({ className }: { className?: string }) {
  const { online } = useConnectivity()
  const { pending, syncing } = useOfflineQueue()

  if (online && pending === 0) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        online
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {syncing ? (
        <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
      ) : (
        <WifiOff className="h-3 w-3" aria-hidden="true" />
      )}
      <span>
        {syncing
          ? `Syncing ${pending}…`
          : online
            ? `${pending} pending`
            : 'Offline'}
      </span>
    </div>
  )
}
