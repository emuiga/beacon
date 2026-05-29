'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { SUPPORTED_LANGS, STORAGE_KEY, type LangCode } from '@/lib/i18n'
import { cn } from '@/lib/utils'

// ── Language labels ───────────────────────────────────────────────────────────

const LANG_LABELS: Record<LangCode, string> = {
  en: 'English',
  sw: 'Kiswahili',
  fr: 'Français',
  ar: 'العربية',
  zh: '中文',
  ru: 'Русский',
  es: 'Español',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()

  const currentLang = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language)
    ? (i18n.language as LangCode)
    : 'en'

  const [current, setCurrent] = useState<LangCode>(currentLang)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value as LangCode
    void i18n.changeLanguage(lang)
    setCurrent(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label={t('language.switch')}
      className={cn(
        'rounded-md border border-border bg-background px-2 py-1 text-xs font-medium',
        'text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer',
        className,
      )}
    >
      {SUPPORTED_LANGS.map((code) => (
        <option key={code} value={code}>
          {LANG_LABELS[code]}
        </option>
      ))}
    </select>
  )
}
