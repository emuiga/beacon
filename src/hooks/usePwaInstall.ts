'use client'

import { useState, useEffect, useCallback } from 'react'

// BeforeInstallPromptEvent is not in TypeScript's lib — declare it locally
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  )
}

export interface PwaInstallState {
  /** True on Android/Chrome when the browser can install the PWA */
  canInstall: boolean
  /** True if already installed (running in standalone mode) */
  isInstalled: boolean
  /** True on iOS — install is manual (Share → Add to Home Screen) */
  isIos: boolean
  /** Whether the user has dismissed the install banner */
  dismissed: boolean
  /** Trigger the native install prompt (only works when canInstall is true) */
  install: () => Promise<void>
  /** Dismiss the install banner */
  dismiss: () => void
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsInstalled(isInStandaloneMode())

    // Check if previously dismissed (persisted across visits)
    const stored = sessionStorage.getItem('pwa-install-dismissed')
    if (stored === 'true') setDismissed(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const standaloneHandler = () => setIsInstalled(true)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', standaloneHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', standaloneHandler)
    }
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt === null) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }, [])

  return {
    canInstall: deferredPrompt !== null,
    isInstalled,
    isIos: isIos(),
    dismissed,
    install,
    dismiss,
  }
}
