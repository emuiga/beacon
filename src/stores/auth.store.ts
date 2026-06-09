import { create } from 'zustand'
import type { UserRole, TrustTier } from '@/types/api'

interface AuthState {
  /** Anonymous session token from POST /auth/anonymous */
  sessionToken: string | null
  /** JWT from OTP verification (verified reporters) or analyst login */
  jwt: string | null
  /** Opaque refresh token for rotating JWTs */
  refreshToken: string | null
  /** Current user role */
  role: UserRole
  /** Trust tier: 0 = anonymous, 1 = phone-verified, 2 = admin-verified */
  trustTier: TrustTier

  setSession: (token: string) => void
  setJwt: (jwt: string, refreshToken: string, role: UserRole) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  sessionToken: null,
  jwt: null,
  refreshToken: null,
  role: 'anonymous',
  trustTier: 0,

  setSession: (token) => set({ sessionToken: token }),

  setJwt: (jwt, refreshToken, role) => set({ jwt, refreshToken, role }),

  clearAuth: () =>
    set({
      sessionToken: null,
      jwt: null,
      refreshToken: null,
      role: 'anonymous',
      trustTier: 0,
    }),
}))
