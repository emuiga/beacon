'use client'

import { cn } from '@/lib/utils'
import type { DamageSeverity } from '@/types/api'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface SeverityBadgeProps {
  severity: DamageSeverity
  className?: string
}

// ── Config ────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<DamageSeverity, { label: string; classes: string }> = {
  minimal: {
    label: 'Minimal',
    classes: 'bg-green-100 text-green-800 border-green-200',
  },
  partial: {
    label: 'Partial',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  destroyed: {
    label: 'Complete Destruction',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
