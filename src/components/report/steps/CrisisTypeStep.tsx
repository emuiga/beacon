'use client'

import { useTranslation } from 'react-i18next'
import { Waves, Activity, Shield, Flame, HelpCircle } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import type { CrisisType } from '@/types/api'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

const ICONS: Record<CrisisType, React.ReactNode> = {
  flood:      <Waves className="h-7 w-7" aria-hidden="true" />,
  earthquake: <Activity className="h-7 w-7" aria-hidden="true" />,
  conflict:   <Shield className="h-7 w-7" aria-hidden="true" />,
  wildfire:   <Flame className="h-7 w-7" aria-hidden="true" />,
  other:      <HelpCircle className="h-7 w-7" aria-hidden="true" />,
}

const TYPES: CrisisType[] = ['flood', 'earthquake', 'conflict', 'wildfire', 'other']

export function CrisisTypeStep() {
  const { t } = useTranslation()
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('report.crisis_type.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('report.crisis_type.description')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label={t('report.crisis_type.title')}>
        {TYPES.map((type) => {
          const selected = draft.crisis_type === type
          return (
            <button
              key={type}
              onClick={() => setField('crisis_type', type)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 min-h-[100px] transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
              )}
            >
              {ICONS[type]}
              <span className="text-sm font-medium">{t(`report.crisis_type.${type}`)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
