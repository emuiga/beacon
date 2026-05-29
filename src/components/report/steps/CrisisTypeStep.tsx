'use client'

import { Waves, Activity, Shield, Flame, HelpCircle } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { CRISIS_TYPE_LABELS } from '@/lib/constants'
import type { CrisisType } from '@/types/api'
import { cn } from '@/lib/utils'

const ICONS: Record<CrisisType, React.ReactNode> = {
  flood:      <Waves className="h-7 w-7" aria-hidden="true" />,
  earthquake: <Activity className="h-7 w-7" aria-hidden="true" />,
  conflict:   <Shield className="h-7 w-7" aria-hidden="true" />,
  wildfire:   <Flame className="h-7 w-7" aria-hidden="true" />,
  other:      <HelpCircle className="h-7 w-7" aria-hidden="true" />,
}

const TYPES: CrisisType[] = ['flood', 'earthquake', 'conflict', 'wildfire', 'other']

export function CrisisTypeStep() {
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">What type of crisis?</h2>
        <p className="text-muted-foreground text-sm">Select the event that caused the damage.</p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Crisis type">
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
              <span className="text-sm font-medium">{CRISIS_TYPE_LABELS[type]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
