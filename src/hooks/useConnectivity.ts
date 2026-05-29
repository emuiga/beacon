'use client'

import { useState, useEffect } from 'react'
import { isOnline, subscribeToConnectivity } from '@/features/offline/connectivity'

interface ConnectivityState {
  online: boolean
  /** true on the first client render before the browser value is known */
  hydrating: boolean
}

/**
 * Returns the current network connectivity state.
 *
 * `hydrating` is true for one tick so server-rendered HTML (always "online")
 * matches before we sync to the real browser value, avoiding a hydration mismatch.
 */
export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>({
    online: true,
    hydrating: true,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ online: isOnline(), hydrating: false })

    const unsubscribe = subscribeToConnectivity((online) => {
      setState({ online, hydrating: false })
    })

    return unsubscribe
  }, [])

  return state
}
