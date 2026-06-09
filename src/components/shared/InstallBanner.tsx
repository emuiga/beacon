'use client'

import { Download, Share, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'

/**
 * Shows a contextual PWA install prompt:
 * - Android/Chrome: native "Add to Home Screen" button
 * - iOS Safari: manual instructions (Share → Add to Home Screen)
 * - Hidden if already installed or dismissed
 */
export function InstallBanner() {
  const { canInstall, isInstalled, isIos, dismissed, install, dismiss } = usePwaInstall()

  // Don't show if already installed or dismissed this session
  if (isInstalled || dismissed) return null
  // Show only if we can prompt (Android) or are on iOS
  if (!canInstall && !isIos) return null

  return (
    <div
      role="complementary"
      aria-label="Install Beacon app"
      className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3"
    >
      <div className="bg-primary/10 p-2 shrink-0 mt-0.5">
        <Download className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">Install Beacon</p>
        {isIos ? (
          <p className="text-sm text-muted-foreground mt-0.5">
            Tap{' '}
            <Share className="inline h-3.5 w-3.5 mx-0.5 text-primary" aria-label="Share" />
            {' '}then <strong>Add to Home Screen</strong> to use offline.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">
            Add to your home screen for offline access and faster reporting.
          </p>
        )}

        {canInstall && (
          <button
            onClick={() => { void install() }}
            className="mt-2 text-sm font-semibold text-primary underline underline-offset-2"
          >
            Add to Home Screen
          </button>
        )}
      </div>

      <button
        onClick={dismiss}
        className="shrink-0 p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
