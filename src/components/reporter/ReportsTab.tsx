'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Trash2, RefreshCw, CheckCircle2, Clock, AlertTriangle, ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import { useDrafts } from '@/hooks/useDrafts'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { useSubmitted } from '@/hooks/useSubmitted'
import { SeverityBadge } from '@/components/analyst/SeverityBadge'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

type TabId = 'drafts' | 'queue' | 'submitted'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function relativeTime(ts: number, t: (k: string, opts?: any) => string): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 60)  return t('common.mins_ago',  { count: mins  || 1 })
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return t('common.hours_ago', { count: hrs  })
  return t('common.days_ago', { count: Math.floor(hrs / 24) })
}

function ThumbOrPlaceholder({ blob }: { blob: Blob | null }) {
  const [url] = useState(() => blob !== null ? URL.createObjectURL(blob) : null)

  if (url === null) {
    return (
      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <ImageOff className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={56}
      height={56}
      className="w-14 h-14 rounded-lg object-cover shrink-0"
      // Decode lazily so the main thread isn't blocked on low-end devices
      loading="lazy"
      decoding="async"
    />
  )
}

export function ReportsTab() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('drafts')

  const { drafts,    loading: draftsLoading,    remove: removeDraft }  = useDrafts()
  const { items,     pending,   syncing, triggerSync }                  = useOfflineQueue()
  const { submitted, loading: submittedLoading }                        = useSubmitted()

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'drafts',    label: t('tabs.drafts'),    count: drafts.length    },
    { id: 'queue',     label: t('tabs.sync'),      count: pending          },
    { id: 'submitted', label: t('tabs.submitted'), count: submitted.length },
  ]

  async function handleDeleteDraft(id: string) {
    await removeDraft(id)
    toast.success(t('drafts.deleted'))
  }

  function handleResumeDraft(id: string) {
    router.push(`/report?draft=${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3 max-w-2xl mx-auto">
          <h1 className="text-base font-semibold">{t('tabs.reports')}</h1>
        </div>
        <div className="flex border-b border-border max-w-2xl mx-auto">
          {tabs.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors relative',
                activeTab === id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              role="tab"
              aria-selected={activeTab === id}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">

        {/* Drafts */}
        {activeTab === 'drafts' && (
          <div className="flex flex-col gap-3">
            {draftsLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('common.loading')}</p>
            )}
            {!draftsLoading && drafts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-muted-foreground">{t('drafts.empty')}</p>
                <Link href="/report" className="text-sm text-primary underline underline-offset-2">
                  {t('drafts.start_new')}
                </Link>
              </div>
            )}
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <ThumbOrPlaceholder blob={draft.photo_thumb} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {draft.crisis_type !== null
                      ? t(`report.crisis_type.${draft.crisis_type}`)
                      : t('drafts.untitled')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {draft.damage_severity !== null
                      ? t(`report.severity.${draft.damage_severity}`)
                      : t('drafts.no_severity')}
                    {' · '}
                    {relativeTime(draft.updated_at, t)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleResumeDraft(draft.id)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                  >
                    {t('drafts.resume')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handleDeleteDraft(draft.id) }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={t('drafts.delete')}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Awaiting sync */}
        {activeTab === 'queue' && (
          <div className="flex flex-col gap-3">
            {pending > 0 && !syncing && (
              <button
                type="button"
                onClick={() => { void triggerSync() }}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {t('queue.retry_all')}
              </button>
            )}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="h-8 w-8 text-primary mb-3" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t('queue.empty')}</p>
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <ThumbOrPlaceholder blob={item.photo_blob} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {t(`report.crisis_type.${item.metadata.crisis_type}`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(`report.severity.${item.metadata.damage_severity}`)}
                    {' · '}
                    {relativeTime(item.created_at, t)}
                  </p>
                </div>
                <div className="shrink-0">
                  {item.status === 'syncing' ? (
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" aria-label={t('queue.syncing')} />
                  ) : item.status === 'failed' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" aria-label={t('queue.failed')} />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" aria-label={t('queue.pending')} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submitted */}
        {activeTab === 'submitted' && (
          <div className="flex flex-col gap-3">
            {submittedLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('common.loading')}</p>
            )}
            {!submittedLoading && submitted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">{t('submitted.empty')}</p>
              </div>
            )}
            {submitted.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <ThumbOrPlaceholder blob={item.photo_thumb} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {t(`report.crisis_type.${item.crisis_type}`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {relativeTime(item.submitted_at, t)}
                  </p>
                </div>
                <SeverityBadge severity={item.damage_severity} />
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
