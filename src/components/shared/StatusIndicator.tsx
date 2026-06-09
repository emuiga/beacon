'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

type HealthStatus = 'loading' | 'ok' | 'degraded' | 'outage'

export function StatusIndicator() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<HealthStatus>('loading')

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' })
        const data = (await res.json()) as { status: string }
        if (cancelled) return
        if (data.status === 'ok') setStatus('ok')
        else if (data.status === 'degraded') setStatus('degraded')
        else setStatus('outage')
      } catch {
        if (!cancelled) setStatus('outage')
      }
    }

    void check()
    const interval = setInterval(() => { void check() }, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (status === 'loading') return null

  const config = {
    ok:       { dot: 'bg-emerald-400', pulse: 'bg-emerald-400', label: t('common.status_ok')       },
    degraded: { dot: 'bg-amber-400',   pulse: 'bg-amber-400',   label: t('common.status_degraded') },
    outage:   { dot: 'bg-red-500',     pulse: 'bg-red-500',     label: t('common.status_outage')   },
  }[status]

  return (
    <a
      href="/api/health"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
    >
      <span className="relative flex h-2 w-2">
        {status === 'ok' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulse} opacity-60`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </a>
  )
}
