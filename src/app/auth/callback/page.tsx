'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { logger } from '@/lib/logger'
import type { UserRole, TrustTier } from '@/types/api'

// ── Inner component (uses useSearchParams — must be inside Suspense) ──────────

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setJwt } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const role = searchParams.get('role') as UserRole | null
    const tier = searchParams.get('tier')

    if (token !== null && token !== '' && role !== null) {
      const trustTier = (tier !== null ? parseInt(tier, 10) : 0) as TrustTier
      setJwt(token, role, trustTier)
      logger.info('Auth callback: JWT stored', { role })
      router.replace('/analyst/dashboard')
    } else {
      logger.warn('Auth callback: missing token or role in query params')
      router.replace('/auth/login')
    }
  }, [searchParams, setJwt, router])

  return null
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Authenticating" />
      <p className="text-sm text-muted-foreground mt-3">Authenticating…</p>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
