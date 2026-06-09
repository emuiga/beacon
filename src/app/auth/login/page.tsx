'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowRight, Phone, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { logger } from '@/lib/logger'
import type { OtpVerifyResponse, UserRole, TrustTier } from '@/types/api'

// ── Form types ────────────────────────────────────────────────────────────────

interface PhoneFormValues {
  phone: string
}

interface OtpFormValues {
  otp: string
}

// ── Validation helpers ────────────────────────────────────────────────────────

function validatePhone(value: string): string | true {
  if (value.trim().length < 10) return 'Phone number must be at least 10 digits'
  if (!/^\+?[\d\s\-()]+$/.test(value)) return 'Invalid phone number format'
  return true
}

function validateOtp(value: string): string | true {
  if (value.length !== 6) return 'OTP must be exactly 6 digits'
  if (!/^\d{6}$/.test(value)) return 'OTP must be 6 digits'
  return true
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { setJwt } = useAuthStore()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')

  const phoneForm = useForm<PhoneFormValues>({
    defaultValues: { phone: '' },
  })

  const otpForm = useForm<OtpFormValues>({
    defaultValues: { otp: '' },
  })

  async function onPhoneSubmit(values: PhoneFormValues) {
    const result = validatePhone(values.phone)
    if (result !== true) {
      phoneForm.setError('phone', { message: result })
      return
    }
    try {
      await api.post('/auth/otp/send', { phone: values.phone })
      setPhone(values.phone)
      setStep('otp')
      toast.success(t('auth.login.otp_sent'))
    } catch (err) {
      logger.error('OTP send failed', err)
      toast.error('Failed to send OTP. Please check your number and try again.')
    }
  }

  async function onOtpSubmit(values: OtpFormValues) {
    const result = validateOtp(values.otp)
    if (result !== true) {
      otpForm.setError('otp', { message: result })
      return
    }
    try {
      const res = await api.post<OtpVerifyResponse>('/auth/otp/verify', {
        phone,
        otp: values.otp,
      })
      setJwt(res.token, res.user.role as UserRole, res.user.trust_tier as TrustTier)
      toast.success(t('auth.login.success'))
      router.push('/analyst/dashboard')
    } catch (err) {
      logger.error('OTP verify failed', err)
      toast.error('Invalid or expired OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — hero image ── */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <Image
          src="/images/login-bg.jpg"
          alt="Crisis response field work"
          fill
          className="object-cover object-center"
          priority
          sizes="60vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Bottom branding */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/15 backdrop-blur-sm  p-2.5">
              <Image
                src="/images/light.png"
                alt="Beacon logo"
                width={32}
                height={32}
              />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Beacon</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            {t('landing.footer_tagline')}
          </p>
          <p className="text-white/40 text-xs mt-4 font-medium uppercase tracking-widest">
            {t('auth.login.portal_sub')}
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-white">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <Image src="/images/light.png" alt="Beacon logo" width={28} height={28} />
          <span className="font-bold text-gray-900 text-xl tracking-tight">Beacon</span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          {step === 'phone' ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {t('auth.login.title_portal')}
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  Enter your phone number to receive a one-time code.
                </p>
              </div>

              <form
                onSubmit={(e) => { void phoneForm.handleSubmit(onPhoneSubmit)(e) }}
                noValidate
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+254 700 000000"
                      aria-describedby={
                        phoneForm.formState.errors.phone !== undefined ? 'phone-error' : undefined
                      }
                      aria-invalid={phoneForm.formState.errors.phone !== undefined}
                      className="w-full  border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006eb5] focus:border-transparent transition-shadow"
                      {...phoneForm.register('phone')}
                    />
                  </div>
                  {phoneForm.formState.errors.phone !== undefined && (
                    <p id="phone-error" role="alert" className="text-xs text-red-600">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={phoneForm.formState.isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#006eb5] hover:bg-[#005a96] disabled:opacity-60 text-white text-sm font-bold  transition-colors"
                >
                  {phoneForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Enter your code
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-gray-800">{phone}</span>.
                </p>
              </div>

              <form
                onSubmit={(e) => { void otpForm.handleSubmit(onOtpSubmit)(e) }}
                noValidate
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    One-time code
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="otp"
                      type="text"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      aria-describedby={
                        otpForm.formState.errors.otp !== undefined ? 'otp-error' : undefined
                      }
                      aria-invalid={otpForm.formState.errors.otp !== undefined}
                      className="w-full  border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-900 tracking-[0.3em] placeholder:text-gray-400 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#006eb5] focus:border-transparent transition-shadow"
                      {...otpForm.register('otp')}
                    />
                  </div>
                  {otpForm.formState.errors.otp !== undefined && (
                    <p id="otp-error" role="alert" className="text-xs text-red-600">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpForm.formState.isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#006eb5] hover:bg-[#005a96] disabled:opacity-60 text-white text-sm font-bold  transition-colors"
                >
                  {otpForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 text-center transition-colors"
                  onClick={() => {
                    setStep('phone')
                    otpForm.reset()
                  }}
                >
                  Use a different number
                </button>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Not an analyst?{' '}
              <Link
                href="/"
                className="text-[#006eb5] hover:text-[#005a96] font-medium underline underline-offset-2 transition-colors"
              >
                Continue as Reporter
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
