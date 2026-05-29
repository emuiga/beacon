'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { MapPin, Loader2, ArrowRight, Phone, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
      toast.success('OTP sent to your phone')
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
      toast.success('Signed in successfully')
      router.push('/analyst/dashboard')
    } catch (err) {
      logger.error('OTP verify failed', err)
      toast.error('Invalid or expired OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-xl p-3 mb-3">
            <MapPin className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Beacon</h1>
          <p className="text-sm text-muted-foreground mt-1">Analyst Portal</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          {step === 'phone' ? (
            <>
              <div className="mb-5">
                <h2 className="text-base font-semibold">Sign in</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your phone number to receive a one-time code.
                </p>
              </div>

              <form
                onSubmit={(e) => { void phoneForm.handleSubmit(onPhoneSubmit)(e) }}
                noValidate
                className="flex flex-col gap-4"
              >
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+254 700 000000"
                      aria-describedby={phoneForm.formState.errors.phone !== undefined ? 'phone-error' : undefined}
                      aria-invalid={phoneForm.formState.errors.phone !== undefined}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      {...phoneForm.register('phone')}
                    />
                  </div>
                  {phoneForm.formState.errors.phone !== undefined && (
                    <p id="phone-error" role="alert" className="text-xs text-destructive mt-1">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={phoneForm.formState.isSubmitting}
                >
                  {phoneForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                  Send OTP
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-base font-semibold">Enter your code</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-foreground">{phone}</span>.
                </p>
              </div>

              <form
                onSubmit={(e) => { void otpForm.handleSubmit(onOtpSubmit)(e) }}
                noValidate
                className="flex flex-col gap-4"
              >
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
                    One-time code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="otp"
                      type="text"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      aria-describedby={otpForm.formState.errors.otp !== undefined ? 'otp-error' : undefined}
                      aria-invalid={otpForm.formState.errors.otp !== undefined}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm tracking-widest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      {...otpForm.register('otp')}
                    />
                  </div>
                  {otpForm.formState.errors.otp !== undefined && (
                    <p id="otp-error" role="alert" className="text-xs text-destructive mt-1">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={otpForm.formState.isSubmitting}
                >
                  {otpForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                  Sign in
                </Button>

                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 text-center"
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
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground mt-5">
          Not an analyst?{' '}
          <Link
            href="/"
            className="text-primary hover:underline underline-offset-2 font-medium"
          >
            Continue as Reporter
          </Link>
        </p>
      </div>
    </div>
  )
}
