'use client'

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { logger } from '@/lib/logger'
import type { AnonymousAuthResponse } from '@/types/api'

function AnonymousSessionInit() {
  const { sessionToken, jwt, setSession } = useAuthStore()

  useEffect(() => {
    // Skip if we already have a session token or a full JWT (analyst/verified)
    if (sessionToken !== null || jwt !== null) return

    api
      .post<AnonymousAuthResponse>('/auth/anonymous')
      .then((res) => {
        setSession(res.session_token)
        logger.info('Anonymous session initialised')
      })
      .catch((err) => {
        logger.warn('Failed to initialise anonymous session', err)
      })
  }, [sessionToken, jwt, setSession])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AnonymousSessionInit />
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  )
}
