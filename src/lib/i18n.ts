import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import sw from '@/locales/sw.json'
import fr from '@/locales/fr.json'
import es from '@/locales/es.json'
import ar from '@/locales/ar.json'
import zh from '@/locales/zh.json'
import ru from '@/locales/ru.json'

// ── Language persistence ───────────────────────────────────────────────────────

export const SUPPORTED_LANGS = ['en', 'sw', 'fr', 'ar', 'zh', 'ru', 'es'] as const
export type LangCode = (typeof SUPPORTED_LANGS)[number]
export const STORAGE_KEY = 'beacon_language'

function getInitialLang(): LangCode {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null
    if (stored !== null && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return 'en'
}

// ── Init (runs once per module load) ─────────────────────────────────────────

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
    fr: { translation: fr },
    es: { translation: es },
    ar: { translation: ar },
    zh: { translation: zh },
    ru: { translation: ru },
  },
  lng: getInitialLang(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
