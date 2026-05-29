import { Suspense } from 'react'
import { ReportForm } from '@/components/report/ReportForm'

export default function ReportPage() {
  return (
    <Suspense>
      <ReportForm />
    </Suspense>
  )
}
