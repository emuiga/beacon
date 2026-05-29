import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Beacon — Crisis Damage Reporter',
  description:
    'Community-driven infrastructure damage reporting for sudden-onset crises.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Beacon' },
}

export const viewport: Viewport = {
  themeColor: '#006eb5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
