'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, CheckCircle2, BookmarkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useReportDraftStore } from '@/stores/report-draft.store'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { api } from '@/lib/api'
import { saveDraft, getDraft, deleteDraft, draftCount } from '@/features/offline/drafts'
import { saveSubmitted } from '@/features/offline/submitted'
import { logger } from '@/lib/logger'
import '@/lib/i18n'
import { PhotoStep } from './steps/PhotoStep'
import { CrisisTypeStep } from './steps/CrisisTypeStep'
import { InfraTypeStep } from './steps/InfraTypeStep'
import { SeverityStep } from './steps/SeverityStep'
import { LocationStep } from './steps/LocationStep'
import { DetailsStep } from './steps/DetailsStep'
import type { ReportSubmission } from '@/types/api'
import { cn } from '@/lib/utils'

const MAX_DRAFTS = 10

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

interface ReportCreateResponse {
  id: string
}

export function ReportForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  const { draft, resetDraft, setField } = useReportDraftStore()
  const { online } = useConnectivity()
  const { addToQueue } = useOfflineQueue()
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [attempted,     setAttempted]     = useState(false)
  const [resumedDraftId, setResumedDraftId] = useState<string | null>(null)
  const firstErrorRef = useRef<HTMLElement | null>(null)

  // Bootstrap session token
  useEffect(() => {
    if (draft.session_token === '') {
      setField('session_token', crypto.randomUUID())
    }
  }, [draft.session_token, setField])

  // Load a saved draft if ?draft=<id> is in the URL
  useEffect(() => {
    if (draftId === null) return

    getDraft(draftId)
      .then((saved) => {
        if (saved === undefined) return
        setField('crisis_type',          saved.crisis_type)
        setField('infrastructure_type',  saved.infrastructure_type)
        setField('damage_severity',      saved.damage_severity)
        setField('lat',                  saved.lat)
        setField('lng',                  saved.lng)
        setField('landmark_description', saved.landmark_description)
        setField('electricity_status',   saved.electricity_status)
        setField('health_services_status', saved.health_services_status)
        setField('most_pressing_needs',  saved.most_pressing_needs)
        setField('debris_clearing_needed', saved.debris_clearing_needed)
        // Restore photo blob as File so PhotoStep can preview it
        if (saved.photo_blob !== null) {
          setField('photo', new File([saved.photo_blob], 'draft-photo.jpg', { type: 'image/jpeg' }))
        }
        setResumedDraftId(draftId)
      })
      .catch((err) => logger.error('ReportForm: failed to load draft', err))
  // Only run when draftId changes — not when setField re-creates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId])

  const complete = {
    photo:    draft.photo !== null,
    crisis:   draft.crisis_type !== null,
    infra:    draft.infrastructure_type !== null,
    severity: draft.damage_severity !== null,
    location: draft.lat !== null || draft.landmark_description.trim().length > 0,
    details:  draft.debris_clearing_needed !== null,
  }

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

  async function handleSaveDraft() {
    setIsSavingDraft(true)
    try {
      const count = await draftCount()
      if (count >= MAX_DRAFTS && resumedDraftId === null) {
        toast.error(t('drafts.limit_reached', { max: MAX_DRAFTS }))
        return
      }

      const id = resumedDraftId ?? crypto.randomUUID()
      await saveDraft({
        id,
        created_at:             resumedDraftId !== null ? Date.now() : Date.now(),
        updated_at:             Date.now(),
        photo_blob:             draft.photo,
        crisis_type:            draft.crisis_type,
        infrastructure_type:    draft.infrastructure_type,
        damage_severity:        draft.damage_severity,
        lat:                    draft.lat,
        lng:                    draft.lng,
        landmark_description:   draft.landmark_description,
        electricity_status:     draft.electricity_status,
        health_services_status: draft.health_services_status,
        most_pressing_needs:    draft.most_pressing_needs,
        debris_clearing_needed: draft.debris_clearing_needed,
        session_token:          draft.session_token,
      })

      resetDraft()
      toast.success(t('drafts.saved'))
      router.push('/my-reports')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.startsWith('DRAFT_LIMIT')) {
        toast.error(t('drafts.limit_reached', { max: MAX_DRAFTS }))
      } else {
        toast.error(t('drafts.save_failed'))
        logger.error('ReportForm: save draft failed', err)
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  async function handleSubmit() {
    setAttempted(true)
    const missing = Object.values(complete).some((v) => !v)
    if (missing) {
      const sectionIds = ['photo', 'crisis', 'infra', 'severity', 'location', 'details'] as const
      const firstMissing = sectionIds.find((k) => !complete[k])
      if (firstMissing !== undefined) {
        const el = document.getElementById(firstMissing)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstErrorRef.current = el as HTMLElement
      }
      toast.error(t('report.form.submit_incomplete'))
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

    const localId = crypto.randomUUID()
    const body = new FormData()
    body.append('photo', draft.photo, 'photo.jpg')
    body.append('crisis_type',          draft.crisis_type ?? '')
    body.append('infrastructure_type',  draft.infrastructure_type ?? '')
    body.append('damage_severity',      draft.damage_severity ?? '')
    if (draft.lat !== null) body.append('lat', String(draft.lat))
    if (draft.lng !== null) body.append('lng', String(draft.lng))
    if (draft.landmark_description)  body.append('landmark_description',   draft.landmark_description)
    if (draft.electricity_status !== null)     body.append('electricity_status',     String(draft.electricity_status))
    if (draft.health_services_status !== null) body.append('health_services_status', String(draft.health_services_status))
    if (draft.most_pressing_needs)   body.append('most_pressing_needs',    draft.most_pressing_needs)
    if (draft.debris_clearing_needed !== null) body.append('debris_clearing_needed', String(draft.debris_clearing_needed))
    body.append('session_token', draft.session_token)

    try {
      const { id } = await api.post<ReportCreateResponse>('/reports', body)

      // Delete the draft we resumed from (if any) and log to submitted history
      if (resumedDraftId !== null) await deleteDraft(resumedDraftId)
      await saveSubmitted({
        id,
        local_id:       localId,
        submitted_at:   Date.now(), // eslint-disable-line react-hooks/purity
        crisis_type:    draft.crisis_type ?? 'other',
        infrastructure_type: draft.infrastructure_type ?? 'residential',
        damage_severity: draft.damage_severity ?? 'minimal',
        status:          'pending',
        photo_thumb:     null,
      })

      resetDraft()
      router.push(`/report/success?id=${id}`)
    } catch {
      toast.info(t('report.errors.network_error'))
      await submitOffline()
    }
  }

  async function submitOffline() {
    if (draft.photo === null) return

    const localId = crypto.randomUUID()
    const metadata: Omit<ReportSubmission, 'photo'> = {
      crisis_type:            draft.crisis_type ?? 'other',
      infrastructure_type:    draft.infrastructure_type ?? 'residential',
      damage_severity:        draft.damage_severity ?? 'minimal',
      electricity_status:     draft.electricity_status,
      health_services_status: draft.health_services_status,
      debris_clearing_needed: draft.debris_clearing_needed ?? false,
      session_token:          draft.session_token,
      ...(draft.lat !== null ? { lat: draft.lat } : {}),
      ...(draft.lng !== null ? { lng: draft.lng } : {}),
      ...(draft.landmark_description  ? { landmark_description:  draft.landmark_description }  : {}),
      ...(draft.most_pressing_needs   ? { most_pressing_needs:   draft.most_pressing_needs }   : {}),
    }

    await addToQueue({
      id:              localId,
      status:          'pending',
      attempts:        0,
      created_at:      Date.now(),
      photo_blob:      draft.photo,
      photo_preview_url: URL.createObjectURL(draft.photo),
      metadata,
    })

    if (resumedDraftId !== null) await deleteDraft(resumedDraftId)
    resetDraft()
    router.push('/report/success?offline=true')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2 px-4 py-3 max-w-2xl mx-auto w-full">
          <button
            onClick={handleDiscard}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={t('common.cancel')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">{t('report.form.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('report.form.sections_complete', {
                done:  Object.values(complete).filter(Boolean).length,
                total: 6,
              })}
            </p>
          </div>
          <LanguageSwitcher className="shrink-0" />
          {/* Save draft button */}
          <button
            onClick={() => { void handleSaveDraft() }}
            disabled={isSavingDraft}
            className="shrink-0 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label={t('drafts.save')}
          >
            <BookmarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* Desktop submit */}
          <div className="hidden md:block shrink-0">
            <Button
              onClick={() => { void handleSubmit() }}
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? t('common.loading') : t('report.details.submit')}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <FormSection id="photo"    isComplete={complete.photo}    hasError={errors.photo}>
            <PhotoStep />
          </FormSection>
          <FormSection id="crisis"   isComplete={complete.crisis}   hasError={errors.crisis}>
            <CrisisTypeStep />
          </FormSection>
          <FormSection id="infra"    isComplete={complete.infra}    hasError={errors.infra}>
            <InfraTypeStep />
          </FormSection>
          <FormSection id="severity" isComplete={complete.severity} hasError={errors.severity}>
            <SeverityStep />
          </FormSection>
          <FormSection id="location" isComplete={complete.location} hasError={errors.location}>
            <LocationStep onDiscard={handleDiscard} />
          </FormSection>
          <FormSection id="details"  isComplete={complete.details}  hasError={errors.details}>
            <DetailsStep onSubmit={() => { void handleSubmit() }} isSubmitting={isSubmitting} />
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
          {isSubmitting ? t('common.loading') : t('report.details.submit')}
        </Button>
      </footer>
    </div>
  )
}
