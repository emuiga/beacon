'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, Map, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { useDrafts } from '@/hooks/useDrafts'
import { cn } from '@/lib/utils'
import '@/lib/i18n'

const TABS = [
  { href: '/',           icon: PlusCircle,  labelKey: 'tabs.submit'  },
  { href: '/map',        icon: Map,         labelKey: 'tabs.map'     },
  { href: '/my-reports', icon: FolderOpen,  labelKey: 'tabs.reports' },
] as const

export function TabBar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { pending } = useOfflineQueue()
  const { drafts }  = useDrafts()

  const badge = (href: string): number => {
    if (href === '/my-reports') return drafts.length + pending
    return 0
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 bg-background border-t border-border safe-area-inset-bottom"
      aria-label={t('tabs.nav_label')}
    >
      <div className="flex items-stretch h-16 max-w-2xl mx-auto">
        {TABS.map(({ href, icon: Icon, labelKey }) => {
          const count   = badge(href)
          const isActive = href === '/'
            ? pathname === '/'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {count > 0 && (
                  <span
                    aria-label={`${count} pending`}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center"
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
