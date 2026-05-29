'use client'

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { DAMAGE_SEVERITY_LABELS } from '@/lib/constants'
import type { DamageSeverity } from '@/types/api'
import { cn } from '@/lib/utils'

const SEVERITY_CONFIG: Record<
  DamageSeverity,
  { icon: React.ReactNode; description: string; color: string; selectedColor: string }
> = {
  minimal: {
    icon: <CheckCircle2 className="h-8 w-8" aria-hidden="true" />,
    description: 'Damage is minor — structure is still usable.',
    color: 'text-green-600',
    selectedColor: 'border-green-600 bg-green-600 text-white',
  },
  partial: {
    icon: <AlertTriangle className="h-8 w-8" aria-hidden="true" />,
    description: 'Significant damage — structure is impaired or unsafe.',
    color: 'text-orange-500',
    selectedColor: 'border-orange-500 bg-orange-500 text-white',
  },
  destroyed: {
    icon: <XCircle className="h-8 w-8" aria-hidden="true" />,
    description: 'Complete destruction — structure is unusable or collapsed.',
    color: 'text-red-600',
    selectedColor: 'border-red-600 bg-red-600 text-white',
  },
}

const SEVERITIES: DamageSeverity[] = ['minimal', 'partial', 'destroyed']

export function SeverityStep() {
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">How severe is the damage?</h2>
        <p className="text-muted-foreground text-sm">
          Select the severity level. Colour, icon, and label all indicate severity.
        </p>
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="Damage severity">
        {SEVERITIES.map((severity) => {
          const config = SEVERITY_CONFIG[severity]
          const selected = draft.damage_severity === severity
          return (
            <button
              key={severity}
              onClick={() => setField('damage_severity', severity)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 px-5 py-4 min-h-[72px] text-left transition-colors',
                selected
                  ? config.selectedColor
                  : `border-border bg-card hover:border-current ${config.color}`,
              )}
            >
              <span className={selected ? 'text-white' : config.color}>
                {config.icon}
              </span>
              <div>
                <div className="font-semibold text-base">
                  {DAMAGE_SEVERITY_LABELS[severity]}
                </div>
                <div className={cn('text-sm', selected ? 'text-white/80' : 'text-muted-foreground')}>
                  {config.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
