'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, ArrowDown, Download, Share2, Camera, MapPin, ClipboardList, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { StatusIndicator } from '@/components/shared/StatusIndicator'

const HERO_IMAGES = [
  '/images/crisis-background.jpg',
  '/images/earthquake-bg.jpg',
  '/images/fire-bg.jpg',
  '/images/flood-bg.jpg',
]

export default function ReporterHomePage() {
  const { t } = useTranslation()
  const { canInstall, isInstalled, isIos, install } = usePwaInstall()
  const [heroIndex, setHeroIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)
        setFading(false)
      }, 500)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      image: '/images/taking-photo-flood.jpg',
      alt: 'Person photographing flood damage',
      icon: <Camera className="h-4 w-4" aria-hidden="true" />,
      label: t('landing.step1_label'),
      title: t('landing.step1_title'),
      desc: t('landing.step1_desc'),
    },
    {
      image: '/images/location-input.jpg',
      alt: 'Entering location on a phone',
      icon: <MapPin className="h-4 w-4" aria-hidden="true" />,
      label: t('landing.step2_label'),
      title: t('landing.step2_title'),
      desc: t('landing.step2_desc'),
    },
    {
      image: '/images/fill-form.jpg',
      alt: 'Person filling in the damage report form',
      icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
      label: t('landing.step3_label'),
      title: t('landing.step3_title'),
      desc: t('landing.step3_desc'),
    },
    {
      image: '/images/offline-sync.webp',
      alt: 'Offline sync, reports upload when back online',
      icon: <WifiOff className="h-4 w-4" aria-hidden="true" />,
      label: t('landing.step4_label'),
      title: t('landing.step4_title'),
      desc: t('landing.step4_desc'),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-5 py-3 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/light.png"
              alt="Beacon logo"
              width={32}
              height={32}
              className="shrink-0"
            />
            <span className="font-bold text-gray-900 tracking-tight text-lg">Beacon</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/auth/login"
              className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {t('landing.analyst_link')}
            </Link>
            <LanguageSwitcher />
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#006eb5] hover:bg-[#005a96] text-white text-sm font-semibold transition-colors"
            >
              {t('landing.cta_report')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with carousel */}
      <section className="relative min-h-screen flex flex-col justify-end pt-16">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGES[heroIndex] ?? '/images/crisis-background.jpg'}
            alt="Crisis response scene"
            fill
            className={`object-cover object-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 px-5 pb-16 pt-24 max-w-6xl mx-auto w-full">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#63b3ed] mb-4">
              {t('landing.hero_badge')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              {t('landing.title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-lg">
              {t('landing.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/report"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#006eb5] hover:bg-[#005a96] text-white text-base font-bold transition-colors shadow-lg"
              >
                {t('landing.cta_report')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              {/* Install CTA — context-aware */}
              {isInstalled ? null : canInstall ? (
                <button
                  onClick={() => { void install() }}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 border border-white text-white hover:bg-white hover:text-[#003975] transition-colors text-base font-semibold"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t('landing.cta_install')}
                </button>
              ) : isIos ? (
                <button
                  onClick={() => setShowIosHint((h) => !h)}
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 border border-white text-white hover:bg-white hover:text-[#003975] transition-colors text-base font-semibold"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t('landing.cta_install')}
                </button>
              ) : (
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 border border-white text-white hover:bg-white hover:text-[#003975] transition-colors text-base font-semibold"
                >
                  {t('landing.cta_learn')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* iOS install hint */}
            {isIos && showIosHint && !isInstalled && (
              <div className="mt-4 flex items-start gap-2 text-white/80 text-sm max-w-xs">
                <Share2 className="h-4 w-4 mt-0.5 shrink-0 text-white/60" aria-hidden="true" />
                <span>{t('landing.ios_hint')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#006eb5] text-white py-10 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-white/20">
          {[
            { label: t('landing.stats_anonymous'), desc: t('landing.stats_anonymous_desc') },
            { label: t('landing.stats_offline'),   desc: t('landing.stats_offline_desc')   },
            { label: t('landing.stats_realtime'),  desc: t('landing.stats_realtime_desc')  },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center px-4">
              <p className="text-xl font-bold">{stat.label}</p>
              <p className="text-sm text-white/70 mt-0.5">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {t('landing.how_title')}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              {t('landing.how_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
            {steps.map((step) => (
              <div key={step.label} className="group bg-white relative h-96 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-white/70">
                    {step.icon}
                    <span className="text-xs font-bold uppercase tracking-widest">{step.label}</span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field section */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative overflow-hidden h-72 md:h-96 bg-gray-100">
            <Image
              src="/images/taking-photo.jpg"
              alt="Reporter documenting urban damage"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-xs font-bold text-[#006eb5] uppercase tracking-widest">
              {t('landing.field_label')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {t('landing.field_title')}
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              {t('landing.field_desc')}
            </p>
            <div className="flex flex-col gap-3 mt-2">
              {[
                t('landing.feature_offline'),
                t('landing.feature_gps'),
                t('landing.feature_anonymous'),
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 bg-[#006eb5] shrink-0" aria-hidden="true" />
                  <span className="text-sm text-gray-600">{feat}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 h-12 px-6 bg-[#006eb5] hover:bg-[#005a96] text-white text-sm font-bold transition-colors"
              >
                {t('landing.cta_report')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003975] text-white mt-auto">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand col */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/light.png"
                  alt="Beacon logo"
                  width={28}
                  height={28}
                  className="opacity-90"
                />
                <span className="font-bold text-white text-lg tracking-tight">Beacon</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                {t('landing.footer_tagline')}
              </p>
              <div className="mt-2">
                <StatusIndicator />
              </div>
            </div>

            {/* Report col */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                {t('landing.footer_col_report')}
              </p>
              <div className="flex flex-col gap-2.5">
                <Link href="/report" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_start')}
                </Link>
                <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_how')}
                </a>
                <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_analyst')}
                </Link>
              </div>
            </div>

            {/* Legal col */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                {t('landing.footer_col_legal')}
              </p>
              <div className="flex flex-col gap-2.5">
                <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_privacy')}
                </Link>
                <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_terms')}
                </Link>
                <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('landing.footer_contact')}
                </Link>
              </div>
            </div>

            {/* Resources col */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                {t('landing.footer_col_resources')}
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="https://www.undp.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t('landing.footer_undp')}
                </a>
                <a
                  href="https://github.com/ORIGIN-HQ/UNDP-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t('landing.footer_github')}
                </a>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40 text-center sm:text-left">
              {t('landing.footer_rights')}
            </p>
            <p className="text-xs text-white/40">
              {t('landing.privacy_note')}
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
