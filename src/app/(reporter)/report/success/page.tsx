'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, WifiOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const isOffline = params.get('offline') === 'true'
  const reportId = params.get('id')

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <div
          className={`rounded-full p-5 ${isOffline ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
        >
          {isOffline ? (
            <WifiOff className="h-10 w-10" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {isOffline ? 'Saved Locally' : 'Report Submitted'}
          </h1>
          <p className="mt-2 text-muted-foreground text-base max-w-xs">
            {isOffline
              ? 'Your report has been saved on this device. It will be uploaded automatically when you reconnect.'
              : 'Thank you. UNDP analysts will review your report and coordinate a response.'}
          </p>
        </div>

        {reportId !== null && (
          <p className="text-sm text-muted-foreground">
            Report ID: <code className="font-mono text-foreground">{reportId}</code>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href="/report">
          <Button size="lg" className="w-full h-14 text-base">
            Submit Another Report
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full h-14 text-base gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>
      </div>
    </main>
  )
}

export default function ReportSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
