'use client'

import { Zap, Heart, Trash2 } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { cn } from '@/lib/utils'

// onSubmit/isSubmitting are kept for ReportWizard compatibility but unused in ReportForm.
// Submission in ReportForm is handled by the sticky footer and header button.
interface DetailsStepProps {
  onSubmit?: () => void
  isSubmitting?: boolean
}

type TriState = boolean | null
const TRI_OPTIONS: { value: TriState; label: string }[] = [
  { value: true, label: 'Working' },
  { value: false, label: 'Not Working' },
  { value: null, label: 'Unknown' },
]

interface TriButtonGroupProps {
  label: string
  value: TriState
  onChange: (v: TriState) => void
  icon: React.ReactNode
}

function TriButtonGroup({ label, value, onChange, icon }: TriButtonGroupProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
        {icon}
        {label}
      </label>
      <div className="flex gap-2" role="group" aria-label={label}>
        {TRI_OPTIONS.map((opt) => (
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

export function DetailsStep({ onSubmit, isSubmitting }: DetailsStepProps) {
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Additional details</h2>
        <p className="text-muted-foreground text-sm">
          These fields help prioritise relief efforts.
        </p>
      </div>

      <TriButtonGroup
        label="Electricity"
        icon={<Zap className="h-4 w-4" aria-hidden="true" />}
        value={draft.electricity_status}
        onChange={(v) => setField('electricity_status', v)}
      />

      <TriButtonGroup
        label="Health Services"
        icon={<Heart className="h-4 w-4" aria-hidden="true" />}
        value={draft.health_services_status}
        onChange={(v) => setField('health_services_status', v)}
      />

      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Debris clearing needed?
        </label>
        <div className="flex gap-2" role="group" aria-label="Debris clearing needed">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
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
          Most pressing needs <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="needs"
          rows={3}
          placeholder="e.g. Drinking water, emergency shelter, medical supplies…"
          value={draft.most_pressing_needs}
          onChange={(e) => setField('most_pressing_needs', e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

    </div>
  )
}
