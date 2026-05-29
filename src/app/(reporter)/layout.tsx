import { OfflineBanner } from '@/components/report/OfflineBanner'

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  )
}
