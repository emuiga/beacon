/**
 * Lightweight online/offline detection.
 * Works in both browser and SSR (Next.js server renders as "online").
 */

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export type ConnectivityListener = (online: boolean) => void

/**
 * Subscribes to online/offline events.
 * Returns an unsubscribe function — always call it on cleanup.
 */
export function subscribeToConnectivity(listener: ConnectivityListener): () => void {
  if (typeof window === 'undefined') return () => { /* no-op in SSR */ }

  const onOnline  = () => listener(true)
  const onOffline = () => listener(false)

  window.addEventListener('online',  onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online',  onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
