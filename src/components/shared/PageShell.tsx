'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'

interface PageShellProps {
  children: React.ReactNode
}

export function PageShell({ children }: PageShellProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="flex items-center justify-between px-5 py-3 max-w-4xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/light.png" alt="Beacon" width={28} height={28} />
            <span className="font-bold text-gray-900 tracking-tight">Beacon</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto px-5 py-14 w-full">
        {children}
      </main>
      <footer className="border-t border-gray-100 px-5 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.home')}
          </Link>
          <p className="text-xs text-gray-400">Open source · MIT License · UNDP InnoCentive</p>
        </div>
      </footer>
    </div>
  )
}
