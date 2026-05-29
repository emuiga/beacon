import type { NextConfig } from 'next'
import withSerwist from '@serwist/next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Serwist uses webpack — tell Next.js 16 the webpack config is intentional
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.beacon.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api-staging.beacon.org',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(self), geolocation=(self), microphone=()' },
        ],
      },
    ]
  },
}

export default withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  // Disable in dev — hot reload and service workers conflict
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
