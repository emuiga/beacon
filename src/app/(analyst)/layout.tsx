'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LayoutDashboard, FileText, Download, LogOut, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/analyst/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/analyst/reports', icon: FileText },
  { label: 'Export', href: '/analyst/export', icon: Download },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalystLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, clearAuth } = useAuthStore()

  // Client-side route protection (middleware handles cookie check, this handles
  // cases where Zustand role state is set to non-analyst in-memory)
  useEffect(() => {
    if (role !== 'analyst' && role !== 'admin') {
      router.replace('/auth/login')
    }
  }, [role, router])

  function handleLogout() {
    clearAuth()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar (desktop) */}
      <nav
        className="hidden md:flex flex-col w-56 border-r border-border bg-background shrink-0"
        aria-label="Analyst navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
          <div className="bg-primary rounded-lg p-1.5 shrink-0">
            <MapPin className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm">Beacon</span>
        </div>

        {/* Nav items */}
        <div className="flex-1 flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-1.5 mb-2">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-xs font-medium capitalize">{role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </nav>

      {/* Mobile top nav */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm">Beacon Analyst</span>
          </div>
          <nav className="flex items-center gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  pathname.startsWith(href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:bg-muted',
                )}
                aria-label={label}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
