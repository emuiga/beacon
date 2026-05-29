import Link from 'next/link'
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ReporterHomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-blue-600 text-white rounded-2xl p-4">
            <MapPin className="h-10 w-10" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Beacon</h1>
            <p className="mt-2 text-muted-foreground text-base max-w-xs">
              Report damaged infrastructure in your community so relief can reach those who need it.
            </p>
          </div>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center justify-center w-full max-w-sm h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          Report Damage
        </Link>

        <p className="text-sm text-muted-foreground max-w-xs">
          No account required. Reports are anonymous by default.
        </p>
      </section>

      {/* Feature hints */}
      <section className="px-6 pb-12 max-w-sm mx-auto w-full">
        <div className="flex flex-col gap-3">
          {[
            {
              icon: <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />,
              text: 'Works offline — reports sync when you reconnect',
            },
            {
              icon: <MapPin className="h-5 w-5 text-blue-500" aria-hidden="true" />,
              text: 'GPS-located so responders know exactly where to go',
            },
            {
              icon: <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
              text: 'Verified by UNDP analysts before being acted on',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
