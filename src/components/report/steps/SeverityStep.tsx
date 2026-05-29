'use client'

import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import type { DamageSeverity } from '@/types/api'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

const SEVERITY_STYLE: Record<DamageSeverity, { icon: React.ReactNode; color: string; selectedColor: string }> = {
  minimal: {
    icon: <CheckCircle2 className="h-8 w-8" aria-hidden="true" />,
    color: 'text-green-600',
    selectedColor: 'border-green-600 bg-green-600 text-white',
  },
  partial: {
    icon: <AlertTriangle className="h-8 w-8" aria-hidden="true" />,
    color: 'text-orange-500',
    selectedColor: 'border-orange-500 bg-orange-500 text-white',
  },
  destroyed: {
    icon: <XCircle className="h-8 w-8" aria-hidden="true" />,
    color: 'text-red-600',
    selectedColor: 'border-red-600 bg-red-600 text-white',
  },
}

const SEVERITIES: DamageSeverity[] = ['minimal', 'partial', 'destroyed']

export function SeverityStep() {
  const { t } = useTranslation()
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('report.severity.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('report.severity.description')}</p>
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label={t('report.severity.title')}>
        {SEVERITIES.map((severity) => {
          const style = SEVERITY_STYLE[severity]
          const selected = draft.damage_severity === severity
          return (
            <button
              key={severity}
              onClick={() => setField('damage_severity', severity)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 px-5 py-4 min-h-[72px] text-left transition-colors',
                selected
                  ? style.selectedColor
                  : `border-border bg-card hover:border-current ${style.color}`,
              )}
            >
              <span className={selected ? 'text-white' : style.color}>
                {style.icon}
              </span>
              <div>
                <div className="font-semibold text-base">
                  {t(`report.severity.${severity}`)}
                </div>
                <div className={cn('text-sm', selected ? 'text-white/80' : 'text-muted-foreground')}>
                  {t(`report.severity.${severity}_desc`)}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
