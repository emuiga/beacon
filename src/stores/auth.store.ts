import { create } from 'zustand'
import type { UserRole, TrustTier } from '@/types/api'

interface AuthState {
  /** Anonymous session token from POST /auth/anonymous */
  sessionToken: string | null
  /** JWT from OTP verification (verified reporters) or analyst login */
  jwt: string | null
  /** Current user role */
  role: UserRole
  /** Trust tier: 0 = anonymous, 1 = phone-verified, 2 = admin-verified */
  trustTier: TrustTier

  setSession: (token: string) => void
  setJwt: (jwt: string, role: UserRole, trustTier: TrustTier) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  sessionToken: null,
  jwt: null,
  role: 'anonymous',
  trustTier: 0,

  setSession: (token) => set({ sessionToken: token }),

  setJwt: (jwt, role, trustTier) => set({ jwt, role, trustTier }),

  clearAuth: () =>
    set({
      sessionToken: null,
      jwt: null,
      role: 'anonymous',
      trustTier: 0,
    }),
}))
