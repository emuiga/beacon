'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportDetail } from '@/components/analyst/ReportDetail'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  function handleClose() {
    router.push('/analyst/reports')
  }

  if (id === '') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Invalid report ID.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back button shown on mobile only — desktop uses the panel close button */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2"
          onClick={handleClose}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Reports
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ReportDetail reportId={id} onClose={handleClose} />
      </div>
    </div>
  )
}
