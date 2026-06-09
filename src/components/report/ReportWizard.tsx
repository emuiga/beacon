'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useReportDraftStore, type WizardStep } from '@/stores/report-draft.store'
import type { ReportMetadata } from '@/types/api'
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
    const metadata: ReportMetadata = {
      crisis_type: draft.crisis_type ?? 'other',
      infrastructure_type: draft.infrastructure_type ?? 'residential',
      damage_severity: draft.damage_severity ?? 'minimal',
      ...(draft.lat !== null ? { lat: draft.lat } : {}),
      ...(draft.lng !== null ? { lng: draft.lng } : {}),
      ...(draft.landmark_description ? { landmark_description: draft.landmark_description } : {}),
      ...(draft.electricity_status !== null ? { electricity_status: draft.electricity_status } : {}),
      ...(draft.health_services_status !== null ? { health_services_status: draft.health_services_status } : {}),
      ...(draft.most_pressing_needs ? { most_pressing_needs: draft.most_pressing_needs } : {}),
      ...(draft.debris_clearing_needed !== null ? { debris_clearing_needed: draft.debris_clearing_needed } : {}),
    }

    const form = new FormData()
    form.append('metadata', JSON.stringify(metadata))
    if (draft.photo !== null) form.append('photo', draft.photo, 'photo.jpg')

    try {
      const res = await api.postForm<{ id: string }>('/reports', form)
      resetDraft()
      router.push(`/report/success?id=${res.id}`)
    } catch {
      toast.info('Could not reach server — saving locally.')
      await submitOffline()
    }
  }

  async function submitOffline() {
    if (draft.photo === null) return

    const metadata: ReportMetadata = {
      crisis_type: draft.crisis_type ?? 'other',
      infrastructure_type: draft.infrastructure_type ?? 'residential',
      damage_severity: draft.damage_severity ?? 'minimal',
      ...(draft.debris_clearing_needed !== null ? { debris_clearing_needed: draft.debris_clearing_needed } : {}),
      ...(draft.electricity_status !== null ? { electricity_status: draft.electricity_status } : {}),
      ...(draft.health_services_status !== null ? { health_services_status: draft.health_services_status } : {}),
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
