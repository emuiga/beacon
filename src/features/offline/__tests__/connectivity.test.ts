import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isOnline, subscribeToConnectivity } from '../connectivity'

describe('isOnline', () => {
  it('returns true when navigator.onLine is true', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(isOnline()).toBe(true)
  })

  it('returns false when navigator.onLine is false', () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(isOnline()).toBe(false)
  })

  it('returns true in SSR (no navigator)', () => {
    vi.stubGlobal('navigator', undefined)
    expect(isOnline()).toBe(true)
  })
})

describe('subscribeToConnectivity', () => {
  let listeners: Record<string, EventListener[]>

  beforeEach(() => {
    listeners = {}
    vi.stubGlobal('window', {
      addEventListener: (event: string, cb: EventListener) => {
        listeners[event] ??= []
        listeners[event]!.push(cb)
      },
      removeEventListener: (event: string, cb: EventListener) => {
        listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb)
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calls listener with true on online event', () => {
    const cb = vi.fn()
    subscribeToConnectivity(cb)
    listeners['online']?.[0]?.(new Event('online'))
    expect(cb).toHaveBeenCalledWith(true)
  })

  it('calls listener with false on offline event', () => {
    const cb = vi.fn()
    subscribeToConnectivity(cb)
    listeners['offline']?.[0]?.(new Event('offline'))
    expect(cb).toHaveBeenCalledWith(false)
  })

  it('removes event listeners on unsubscribe', () => {
    const cb = vi.fn()
    const unsubscribe = subscribeToConnectivity(cb)
    unsubscribe()
    expect(listeners['online']).toHaveLength(0)
    expect(listeners['offline']).toHaveLength(0)
  })

  it('returns a no-op unsubscribe in SSR (no window)', () => {
    vi.stubGlobal('window', undefined)
    const cb = vi.fn()
    expect(() => {
      const unsub = subscribeToConnectivity(cb)
      unsub()
    }).not.toThrow()
  })
})
