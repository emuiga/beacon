'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Supported languages ───────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'sw', label: 'SW' },
] as const

type LangCode = (typeof LANGUAGES)[number]['code']

const STORAGE_KEY = 'beacon_language'

// ── Component ─────────────────────────────────────────────────────────────────

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const [current, setCurrent] = useState<LangCode>('en')

  // Restore persisted language on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null
      if (stored !== null && (stored === 'en' || stored === 'sw')) {
        void i18n.changeLanguage(stored)
        setCurrent(stored)
      }
    } catch {
      // localStorage may not be available
    }
  }, [i18n])

  function handleSwitch(lang: LangCode) {
    void i18n.changeLanguage(lang)
    setCurrent(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn('inline-flex rounded-lg border border-border overflow-hidden', className)}
      role="group"
      aria-label={t('language.switch')}
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSwitch(code)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium transition-colors',
            current === code
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          aria-pressed={current === code}
          aria-label={`${t('language.switch')} to ${t(`language.${code}`)}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
