'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { NearbyReportItem } from '@/types/api'
import { DUPLICATE_AUTO_FLAG_THRESHOLD } from '@/lib/constants'

interface DuplicateWarningProps {
  duplicates: NearbyReportItem[]
  onSameDamage: () => void     // user confirms it's the same — discard draft
  onDifferentDamage: () => void // user says it's different — proceed
}

export function DuplicateWarning({
  duplicates,
  onSameDamage,
  onDifferentDamage,
}: DuplicateWarningProps) {
  const top = duplicates[0]
  if (top === undefined) return null

  const isStrong = top.similarity_score >= DUPLICATE_AUTO_FLAG_THRESHOLD
  const pct = Math.round(top.similarity_score * 100)

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDifferentDamage() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <DialogTitle className="text-amber-700">
              {isStrong ? 'Possible Duplicate' : 'Similar Report Nearby'}
            </DialogTitle>
          </div>
          <DialogDescription>
            A report submitted {formatAge(top.created_at)} nearby looks{' '}
            <strong>{pct}% similar</strong> to yours. Is this the same damage?
          </DialogDescription>
        </DialogHeader>

        {/* NearbyReportItem does not include a photo_url — location only */}

        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="destructive"
            onClick={onSameDamage}
            className="w-full"
          >
            Yes, same damage — discard my report
          </Button>
          <Button
            variant="outline"
            onClick={onDifferentDamage}
            className="w-full"
          >
            No, this is different damage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatAge(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
