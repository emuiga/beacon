import { QueryClient } from '@tanstack/react-query'
import { NetworkError } from './api'

export function isOfflineError(error: unknown): boolean {
  if (error instanceof NetworkError) return true
  if (error instanceof TypeError) {
    return (
      error.message === 'Failed to fetch' ||
      error.message === 'Network request failed' ||
      error.message === 'Load failed'
    )
  }
  return false
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) =>
        failureCount < 2 && !isOfflineError(error),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) =>
        failureCount < 2 && !isOfflineError(error),
    },
  },
})
