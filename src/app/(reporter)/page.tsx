import Link from 'next/link'
import { MapPin, WifiOff, ShieldCheck, ArrowRight } from 'lucide-react'
import { InstallBanner } from '@/components/shared/InstallBanner'

export default function ReporterHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Top bar */}
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary rounded-lg p-1.5">
              <MapPin className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Beacon</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            UNDP Crisis Response
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-5 py-12 max-w-2xl mx-auto w-full gap-8">

        {/* Mission statement */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              Community Reporting Tool
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
            Report infrastructure<br />damage in your area
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
            Help UNDP analysts coordinate crisis response by documenting damaged buildings, roads, and utilities — even without an internet connection.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
          >
            Report Damage
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* PWA install prompt */}
        <InstallBanner />

        {/* Feature list */}
        <ul className="flex flex-col gap-3" aria-label="Key features">
          {[
            {
              icon: <WifiOff className="h-4 w-4 text-amber-600" aria-hidden="true" />,
              text: 'Works offline — reports sync automatically when you reconnect',
            },
            {
              icon: <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />,
              text: 'GPS-located so responders know exactly where to go',
            },
            {
              icon: <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" />,
              text: 'Reports are anonymous and reviewed by UNDP analysts',
            },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

      </section>

      {/* Footer */}
      <footer className="border-t border-border px-5 py-4">
        <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          Data is anonymised and used solely for coordinating humanitarian response.{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </footer>

    </div>
  )
}
