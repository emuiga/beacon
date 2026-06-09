'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { InstallBanner } from '@/components/shared/InstallBanner'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { StatusIndicator } from '@/components/shared/StatusIndicator'

export default function ReporterHomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">

      {/* ── Nav ── */}
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

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-end pt-16">
        <div className="absolute inset-0">
          <Image
            src="/images/crisis-background.jpg"
            alt="Crisis response scene"
            fill
            className="object-cover object-center"
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
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-base font-semibold transition-colors backdrop-blur-sm"
              >
                {t('landing.cta_learn')}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
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

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {t('landing.how_title')}
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              {t('landing.how_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            {/* Step 1 — photograph */}
            <div className="bg-white flex flex-col">
              <div className="relative h-52 bg-gray-100">
                <Image
                  src="/images/taking-photo-flood.jpg"
                  alt="Person photographing flood damage"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#006eb5] tracking-widest uppercase">
                  {t('landing.step1_num')}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-snug">
                  {t('landing.step1_title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('landing.step1_desc')}
                </p>
              </div>
            </div>

            {/* Step 2 — location */}
            <div className="bg-white flex flex-col">
              <div className="relative h-52 bg-gray-100">
                <Image
                  src="/images/location-input.jpg"
                  alt="Entering location on a phone"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#006eb5] tracking-widest uppercase">
                  {t('landing.step2_num')}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-snug">
                  {t('landing.step2_title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('landing.step2_desc')}
                </p>
              </div>
            </div>

            {/* Step 3 — fill form */}
            <div className="bg-white flex flex-col">
              <div className="relative h-52 bg-gray-100">
                <Image
                  src="/images/fill-form.jpg"
                  alt="Person filling in the damage report form"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#006eb5] tracking-widest uppercase">
                  {t('landing.step3_num')}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-snug">
                  {t('landing.step3_title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('landing.step3_desc')}
                </p>
              </div>
            </div>

            {/* Step 4 — offline sync */}
            <div className="bg-white flex flex-col">
              <div className="relative h-52 bg-gray-100">
                <Image
                  src="/images/offline-sync.webp"
                  alt="Offline sync — reports upload when back online"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#006eb5] tracking-widest uppercase">
                  {t('landing.step4_num')}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-snug">
                  {t('landing.step4_title')}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t('landing.step4_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Field section ── */}
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
              {t('landing.label')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {t('landing.title')}
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              {t('landing.description')}
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

      {/* ── PWA install ── */}
      <div className="px-5 pb-4 max-w-6xl mx-auto w-full">
        <InstallBanner />
      </div>

      {/* ── Footer ── */}
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
