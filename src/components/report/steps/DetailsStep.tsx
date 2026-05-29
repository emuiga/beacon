'use client'

import { useTranslation } from 'react-i18next'
import { Zap, Heart, Trash2 } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

// onSubmit/isSubmitting are kept for ReportWizard compatibility but unused in ReportForm.
export interface DetailsStepProps {
  onSubmit?: () => void
  isSubmitting?: boolean
}

type TriState = boolean | null

interface TriButtonGroupProps {
  label: string
  icon: React.ReactNode
  options: { value: TriState; label: string }[]
  value: TriState
  onChange: (v: TriState) => void
}

function TriButtonGroup({ label, icon, options, value, onChange }: TriButtonGroupProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
        {icon}
        {label}
      </label>
      <div className="flex gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              'flex-1 h-11 rounded-lg border-2 text-sm font-medium transition-colors',
              value === opt.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-primary/50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DetailsStep(_props: DetailsStepProps) {
  const { t } = useTranslation()
  const { draft, setField } = useReportDraftStore()

  const electricityOptions = [
    { value: true  as TriState, label: t('report.details.electricity_working') },
    { value: false as TriState, label: t('report.details.electricity_not_working') },
    { value: null  as TriState, label: t('report.details.electricity_unknown') },
  ]

  const healthOptions = [
    { value: true  as TriState, label: t('report.details.health_operational') },
    { value: false as TriState, label: t('report.details.health_not_operational') },
    { value: null  as TriState, label: t('report.details.health_unknown') },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">{t('report.details.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('report.details.description')}</p>
      </div>

      <TriButtonGroup
        label={t('report.details.electricity_label')}
        icon={<Zap className="h-4 w-4" aria-hidden="true" />}
        options={electricityOptions}
        value={draft.electricity_status}
        onChange={(v) => setField('electricity_status', v)}
      />

      <TriButtonGroup
        label={t('report.details.health_label')}
        icon={<Heart className="h-4 w-4" aria-hidden="true" />}
        options={healthOptions}
        value={draft.health_services_status}
        onChange={(v) => setField('health_services_status', v)}
      />

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t('report.details.debris_label')}
        </label>
        <div className="flex gap-2" role="group" aria-label={t('report.details.debris_label')}>
          {[
            { value: true,  label: t('common.yes') },
            { value: false, label: t('common.no') },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setField('debris_clearing_needed', opt.value)}
              aria-pressed={draft.debris_clearing_needed === opt.value}
              className={cn(
                'flex-1 h-11 rounded-lg border-2 text-sm font-medium transition-colors',
                draft.debris_clearing_needed === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="needs" className="block text-sm font-medium mb-1.5">
          {t('report.details.needs_label')}{' '}
          <span className="text-muted-foreground font-normal">({t('common.unknown').toLowerCase()})</span>
        </label>
        <textarea
          id="needs"
          rows={3}
          placeholder={t('report.details.needs_placeholder')}
          value={draft.most_pressing_needs}
          onChange={(e) => setField('most_pressing_needs', e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>
    </div>
  )
}
