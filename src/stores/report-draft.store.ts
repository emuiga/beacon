import { create } from 'zustand'
import type { CrisisType, DamageSeverity, InfrastructureType } from '@/types/api'

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

/** Mutable draft of a report before submission. Uses null for unset fields. */
export interface ReportDraft {
  photo: File | null
  crisis_type: CrisisType | null
  infrastructure_type: InfrastructureType | null
  damage_severity: DamageSeverity | null
  lat: number | null
  lng: number | null
  landmark_description: string
  electricity_status: boolean | null
  health_services_status: boolean | null
  most_pressing_needs: string
  debris_clearing_needed: boolean | null
  session_token: string
}

interface ReportDraftState {
  draft: ReportDraft
  currentStep: WizardStep

  setField: <K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) => void
  nextStep: () => void
  prevStep: () => void
  resetDraft: () => void
}

const initialDraft: ReportDraft = {
  photo: null,
  crisis_type: null,
  infrastructure_type: null,
  damage_severity: null,
  lat: null,
  lng: null,
  landmark_description: '',
  electricity_status: null,
  health_services_status: null,
  most_pressing_needs: '',
  debris_clearing_needed: null,
  session_token: '',
}

export const useReportDraftStore = create<ReportDraftState>()((set) => ({
  draft: { ...initialDraft },
  currentStep: 1,

  setField: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    })),

  nextStep: () =>
    set((state) => ({
      currentStep:
        state.currentStep < 6
          ? ((state.currentStep + 1) as WizardStep)
          : state.currentStep,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep:
        state.currentStep > 1
          ? ((state.currentStep - 1) as WizardStep)
          : state.currentStep,
    })),

  resetDraft: () => set({ draft: { ...initialDraft }, currentStep: 1 }),
}))
