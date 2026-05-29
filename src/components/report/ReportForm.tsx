'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { api } from '@/lib/api'
import { PhotoStep } from './steps/PhotoStep'
import { CrisisTypeStep } from './steps/CrisisTypeStep'
import { InfraTypeStep } from './steps/InfraTypeStep'
import { SeverityStep } from './steps/SeverityStep'
import { LocationStep } from './steps/LocationStep'
import { DetailsStep } from './steps/DetailsStep'
import type { ReportSubmission } from '@/types/api'
import { cn } from '@/lib/utils'

// ── Section wrapper ────────────────────────────────────────────────────────────

interface FormSectionProps {
  id: string
  isComplete: boolean
  hasError: boolean
  children: React.ReactNode
}

function FormSection({ id, isComplete, hasError, children }: FormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative rounded-xl border bg-card p-5 transition-colors',
        hasError ? 'border-destructive' : isComplete ? 'border-primary/30' : 'border-border',
      )}
    >
      {isComplete && (
        <CheckCircle2
          className="absolute top-4 right-4 h-5 w-5 text-primary"
          aria-label="Section complete"
        />
      )}
      {children}
    </section>
  )
}

// ── Response type ──────────────────────────────────────────────────────────────

interface ReportCreateResponse {
  id: string
}

// ── Main form ──────────────────────────────────────────────────────────────────

export function ReportForm() {
  const router = useRouter()
  const { draft, resetDraft, setField } = useReportDraftStore()
  const { online } = useConnectivity()
  const { addToQueue } = useOfflineQueue()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const firstErrorRef = useRef<HTMLElement | null>(null)

  // Bootstrap anonymous session token
  useEffect(() => {
    if (draft.session_token === '') {
      setField('session_token', crypto.randomUUID())
    }
  }, [draft.session_token, setField])

  // Section completion states
  const complete = {
    photo:    draft.photo !== null,
    crisis:   draft.crisis_type !== null,
    infra:    draft.infrastructure_type !== null,
    severity: draft.damage_severity !== null,
    location: draft.lat !== null || draft.landmark_description.trim().length > 0,
    details:  draft.debris_clearing_needed !== null,
  }

  // Only show error state after first submit attempt
  const errors = attempted ? {
    photo:    !complete.photo,
    crisis:   !complete.crisis,
    infra:    !complete.infra,
    severity: !complete.severity,
    location: !complete.location,
    details:  !complete.details,
  } : { photo: false, crisis: false, infra: false, severity: false, location: false, details: false }

  function handleDiscard() {
    resetDraft()
    router.push('/')
  }

  async function handleSubmit() {
    setAttempted(true)
    const missing = Object.values(complete).some((v) => !v)
    if (missing) {
      // Scroll to first incomplete section
      const sectionIds: (keyof typeof complete)[] = ['photo', 'crisis', 'infra', 'severity', 'location', 'details']
      const firstMissing = sectionIds.find((k) => !complete[k])
      if (firstMissing !== undefined) {
        const el = document.getElementById(firstMissing)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstErrorRef.current = el as HTMLElement
      }
      toast.error('Please complete all required sections.')
      return
    }

    setIsSubmitting(true)
    try {
      if (!online) {
        await submitOffline()
      } else {
        await submitOnline()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitOnline() {
    if (draft.photo === null) return

    const body = new FormData()
    body.append('photo', draft.photo, 'photo.jpg')
    body.append('crisis_type', draft.crisis_type ?? '')
    body.append('infrastructure_type', draft.infrastructure_type ?? '')
    body.append('damage_severity', draft.damage_severity ?? '')
    if (draft.lat !== null) body.append('lat', String(draft.lat))
    if (draft.lng !== null) body.append('lng', String(draft.lng))
    if (draft.landmark_description) body.append('landmark_description', draft.landmark_description)
    if (draft.electricity_status !== null) body.append('electricity_status', String(draft.electricity_status))
    if (draft.health_services_status !== null) body.append('health_services_status', String(draft.health_services_status))
    if (draft.most_pressing_needs) body.append('most_pressing_needs', draft.most_pressing_needs)
    if (draft.debris_clearing_needed !== null) body.append('debris_clearing_needed', String(draft.debris_clearing_needed))
    body.append('session_token', draft.session_token)

    try {
      const { id } = await api.post<ReportCreateResponse>('/reports', body)
      resetDraft()
      router.push(`/report/success?id=${id}`)
    } catch {
      toast.info('Could not reach server — saving locally.')
      await submitOffline()
    }
  }

  async function submitOffline() {
    if (draft.photo === null) return

    const metadata: Omit<ReportSubmission, 'photo'> = {
      crisis_type: draft.crisis_type ?? 'other',
      infrastructure_type: draft.infrastructure_type ?? 'residential',
      damage_severity: draft.damage_severity ?? 'minimal',
      electricity_status: draft.electricity_status,
      health_services_status: draft.health_services_status,
      debris_clearing_needed: draft.debris_clearing_needed ?? false,
      session_token: draft.session_token,
      ...(draft.lat !== null ? { lat: draft.lat } : {}),
      ...(draft.lng !== null ? { lng: draft.lng } : {}),
      ...(draft.landmark_description ? { landmark_description: draft.landmark_description } : {}),
      ...(draft.most_pressing_needs ? { most_pressing_needs: draft.most_pressing_needs } : {}),
    }

    await addToQueue({
      id: crypto.randomUUID(),
      status: 'pending',
      attempts: 0,
      created_at: Date.now(),
      photo_blob: draft.photo,
      photo_preview_url: URL.createObjectURL(draft.photo),
      metadata,
    })

    resetDraft()
    router.push('/report/success?offline=true')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3 max-w-2xl mx-auto w-full">
          <button
            onClick={handleDiscard}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Cancel report"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold">New Damage Report</h1>
            <p className="text-xs text-muted-foreground">
              {Object.values(complete).filter(Boolean).length} of 6 sections complete
            </p>
          </div>
          {/* Desktop submit — visible md+ */}
          <div className="hidden md:block">
            <Button
              onClick={() => { void handleSubmit() }}
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </header>

      {/* Form body */}
      <main className="flex-1 px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">

          <FormSection id="photo" isComplete={complete.photo} hasError={errors.photo}>
            <PhotoStep />
          </FormSection>

          <FormSection id="crisis" isComplete={complete.crisis} hasError={errors.crisis}>
            <CrisisTypeStep />
          </FormSection>

          <FormSection id="infra" isComplete={complete.infra} hasError={errors.infra}>
            <InfraTypeStep />
          </FormSection>

          <FormSection id="severity" isComplete={complete.severity} hasError={errors.severity}>
            <SeverityStep />
          </FormSection>

          <FormSection id="location" isComplete={complete.location} hasError={errors.location}>
            <LocationStep onDiscard={handleDiscard} />
          </FormSection>

          <FormSection id="details" isComplete={complete.details} hasError={errors.details}>
            <DetailsStep
              onSubmit={() => { void handleSubmit() }}
              isSubmitting={isSubmitting}
            />
          </FormSection>

        </div>
      </main>

      {/* Mobile sticky submit footer */}
      <footer className="md:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border px-4 py-4 safe-area-inset-bottom">
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold"
          onClick={() => { void handleSubmit() }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Submit Report'}
        </Button>
      </footer>
    </div>
  )
}
