'use client'

import { Home, Building2, Landmark, Zap, Car, Users } from 'lucide-react'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { INFRASTRUCTURE_TYPE_LABELS } from '@/lib/constants'
import type { InfrastructureType } from '@/types/api'
import { cn } from '@/lib/utils'

const ICONS: Record<InfrastructureType, React.ReactNode> = {
  residential: <Home className="h-7 w-7" aria-hidden="true" />,
  commercial:  <Building2 className="h-7 w-7" aria-hidden="true" />,
  government:  <Landmark className="h-7 w-7" aria-hidden="true" />,
  utilities:   <Zap className="h-7 w-7" aria-hidden="true" />,
  transport:   <Car className="h-7 w-7" aria-hidden="true" />,
  community:   <Users className="h-7 w-7" aria-hidden="true" />,
}

const TYPES: InfrastructureType[] = [
  'residential', 'commercial', 'government', 'utilities', 'transport', 'community',
]

export function InfraTypeStep() {
  const { draft, setField } = useReportDraftStore()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">What was damaged?</h2>
        <p className="text-muted-foreground text-sm">Select the type of infrastructure.</p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Infrastructure type">
        {TYPES.map((type) => {
          const selected = draft.infrastructure_type === type
          return (
            <button
              key={type}
              onClick={() => setField('infrastructure_type', type)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 min-h-[100px] transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
              )}
            >
              {ICONS[type]}
              <span className="text-sm font-medium">{INFRASTRUCTURE_TYPE_LABELS[type]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
