'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'
import type { AnalystFilters } from '@/types/api'

// ── Types ─────────────────────────────────────────────────────────────────────

type ExportFormat = 'csv' | 'geojson' | 'shapefile'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ExportPanelProps {
  filters: AnalystFilters
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1'

function buildFilterParams(filters: AnalystFilters): string {
  const params = new URLSearchParams()
  if (filters.crisis_type !== null) params.set('crisis_type', filters.crisis_type)
  if (filters.damage_severity !== null) params.set('damage_severity', filters.damage_severity)
  if (filters.infrastructure_type !== null) params.set('infrastructure_type', filters.infrastructure_type)
  if (filters.status !== null) params.set('status', filters.status)
  if (filters.time_from !== null) params.set('time_from', filters.time_from)
  if (filters.time_to !== null) params.set('time_to', filters.time_to)
  return params.toString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExportPanel({ filters }: ExportPanelProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  async function handleExport(format: ExportFormat) {
    setLoading(format)
    try {
      const qs = buildFilterParams(filters)
      const endpoint = format === 'shapefile' ? 'shapefile' : format
      const url = `${BASE_URL}/export/${endpoint}${qs !== '' ? `?${qs}` : ''}`

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `beacon-export.${format === 'shapefile' ? 'zip' : format}`
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)

      toast.success(`${format.toUpperCase()} download started`)
      logger.info('Export triggered', { format })
    } catch (err) {
      logger.error('Export failed', err)
      toast.error('Export failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const FORMATS: Array<{ format: ExportFormat; label: string; description: string }> = [
    { format: 'csv', label: 'Download CSV', description: 'Tabular data for spreadsheets' },
    { format: 'geojson', label: 'Download GeoJSON', description: 'For GIS tools and mapping' },
    { format: 'shapefile', label: 'Download Shapefile', description: 'ESRI format (.zip)' },
  ]

  return (
    <div className="flex flex-col gap-3" aria-label="Export options">
      {FORMATS.map(({ format, label, description }) => (
        <div key={format} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => { void handleExport(format) }}
            aria-label={label}
            className="gap-1.5 shrink-0 ml-3"
          >
            {loading === format ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Export
          </Button>
        </div>
      ))}
    </div>
  )
}
