'use client'

import { usePathname } from 'next/navigation'
import { OfflineBanner } from '@/components/report/OfflineBanner'
import { TabBar } from '@/components/reporter/TabBar'

// Routes where the tab bar should be hidden (full-screen form flows)
const HIDE_TABS_ON = ['/report', '/report/success']

export default function ReporterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showTabs = !HIDE_TABS_ON.some((p) => pathname.startsWith(p))

  return (
    <>
      <OfflineBanner />
      {/* Extra bottom padding when tab bar is visible so content isn't hidden behind it */}
      <div className={showTabs ? 'pb-16' : undefined}>
        {children}
      </div>
      {showTabs && <TabBar />}
    </>
  )
}
