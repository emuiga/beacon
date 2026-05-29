import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { CacheFirst, NetworkFirst, Serwist, ExpirationPlugin } from 'serwist'

// ── TypeScript augmentation for Serwist's injected manifest ──────────────────

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

// ── Service worker ────────────────────────────────────────────────────────────

const serwist = new Serwist({
  // App shell — injected by @serwist/next at build time
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    // PMTiles basemap — cache-first, 30 day TTL
    // A single range-request file, so CacheFirst is safe
    {
      matcher: /\.pmtiles$/,
      handler: new CacheFirst({
        cacheName: 'pmtiles-v1',
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            maxEntries: 5,
          }),
        ],
      }),
    },

    // Map tile CDN (OpenFreeMap style) — cache-first, 7 day TTL
    {
      matcher: ({ url }) =>
        url.hostname.includes('openfreemap.org') ||
        url.hostname.includes('source.coop'),
      handler: new CacheFirst({
        cacheName: 'map-tiles-v1',
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 7 * 24 * 60 * 60,
            maxEntries: 500,
          }),
        ],
      }),
    },

    // API stats / public data — network-first, 60s staleness
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/api/v1/stats'),
      handler: new NetworkFirst({
        cacheName: 'api-stats-v1',
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 60,
            maxEntries: 10,
          }),
        ],
      }),
    },

    // Google fonts / external font CDN — cache-first
    {
      matcher: ({ url }) =>
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com',
      handler: new CacheFirst({
        cacheName: 'google-fonts-v1',
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 365 * 24 * 60 * 60,
            maxEntries: 20,
          }),
        ],
      }),
    },
  ],
})

serwist.addEventListeners()
