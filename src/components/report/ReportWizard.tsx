'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useReportDraftStore, type WizardStep } from '@/stores/report-draft.store'
import type { ReportSubmission } from '@/types/api'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { api } from '@/lib/api'
import { PhotoStep } from './steps/PhotoStep'
import { CrisisTypeStep } from './steps/CrisisTypeStep'
import { InfraTypeStep } from './steps/InfraTypeStep'
import { SeverityStep } from './steps/SeverityStep'
import { LocationStep } from './steps/LocationStep'
import { DetailsStep } from './steps/DetailsStep'

const STEP_TITLES: Record<WizardStep, string> = {
  1: 'Photo',
  2: 'Crisis Type',
  3: 'Infrastructure',
  4: 'Severity',
  5: 'Location',
  6: 'Details',
}

const TOTAL_STEPS = 6

function validateStep(step: WizardStep, draft: ReturnType<typeof useReportDraftStore.getState>['draft']): string | null {
  switch (step) {
    case 1: return draft.photo === null ? 'Please take or upload a photo.' : null
    case 2: return draft.crisis_type === null ? 'Please select a crisis type.' : null
    case 3: return draft.infrastructure_type === null ? 'Please select an infrastructure type.' : null
    case 4: return draft.damage_severity === null ? 'Please select a damage severity.' : null
    case 5: return (draft.lat === null && draft.landmark_description.trim().length === 0)
      ? 'Please provide a GPS location or location description.' : null
    case 6: return draft.debris_clearing_needed === null ? 'Please indicate debris clearing need.' : null
  }
}

interface ReportCreateResponse {
  id: string
}

export function ReportWizard() {
  const router = useRouter()
  const { draft, currentStep, nextStep, prevStep, resetDraft, setField } = useReportDraftStore()
  const { online } = useConnectivity()
  const { addToQueue } = useOfflineQueue()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bootstrap anonymous session token
  useEffect(() => {
    if (draft.session_token === '') {
      setField('session_token', crypto.randomUUID())
    }
  }, [draft.session_token, setField])

  function handleBack() {
    if (currentStep === 1) {
      router.push('/')
    } else {
      prevStep()
    }
  }

  function handleNext() {
    const error = validateStep(currentStep, draft)
    if (error !== null) {
      toast.error(error)
      return
    }
    nextStep()
  }

  function handleDiscard() {
    resetDraft()
    router.push('/')
  }

  async function handleSubmit() {
    const error = validateStep(6, draft)
    if (error !== null) {
      toast.error(error)
      return
    }

    setIsSubmitting(true)
    try {
      if (!online) {
        await submitOffline()
      } else {
        await submitOnline()
      }
    } catch {
      // submitOnline already falls back to offline on network error
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
      // Network or API error — fall back to offline queue
      toast.info('Could not reach server — saving locally.')
      await submitOffline()
    }
  }

  async function submitOffline() {
    if (draft.photo === null) return

    // exactOptionalPropertyTypes: optional keys must be omitted (not set to undefined).
    // Build required fields first, then spread optional ones conditionally.
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

  const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto w-full">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
            <p className="text-sm font-semibold truncate">{STEP_TITLES[currentStep]}</p>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Step content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {currentStep === 1 && <PhotoStep />}
        {currentStep === 2 && <CrisisTypeStep />}
        {currentStep === 3 && <InfraTypeStep />}
        {currentStep === 4 && <SeverityStep />}
        {currentStep === 5 && <LocationStep onDiscard={handleDiscard} />}
        {currentStep === 6 && <DetailsStep onSubmit={() => { void handleSubmit() }} isSubmitting={isSubmitting} />}
      </main>

      {/* Footer nav — all steps except 6 (which has its own submit button) */}
      {currentStep < 6 && (
        <footer className="sticky bottom-0 bg-background border-t border-border px-4 py-4">
          <div className="max-w-lg mx-auto">
            <Button
              size="lg"
              className="w-full h-14 text-base"
              onClick={handleNext}
            >
              Continue
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
