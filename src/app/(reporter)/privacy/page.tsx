import { PageShell } from '@/components/shared/PageShell'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-[#006eb5] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-10">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">What we collect</h2>
            <p className="mb-3">
              When you submit a damage report, Beacon collects the following information:
            </p>
            <ul className="list-none flex flex-col gap-2 pl-0">
              {[
                'Photos of damaged infrastructure',
                'GPS coordinates (if permission granted) or a text location description',
                'Damage metadata: crisis type, severity, infrastructure type',
                'Status fields: electricity, health services, debris clearing need',
                'Optional free-text field for urgent needs',
                'Device locale (used only for language detection)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 bg-[#006eb5] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">What we do NOT collect</h2>
            <ul className="list-none flex flex-col gap-2 pl-0">
              {[
                'Your name',
                'Phone number (unless you voluntarily complete the optional OTP verification)',
                'Email address',
                'Persistent device identifier',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 bg-gray-400 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How your data is used</h2>
            <p>
              All submitted reports are used solely for UNDP humanitarian coordination and crisis analysis.
              Data is shared with UNDP analysts and authorised response organisations to direct
              field resources. It is never sold, rented, or used for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Anonymisation</h2>
            <p>
              All reports are anonymous by default. An optional phone OTP verification assigns a
              higher trust tier to your reports but does not attach your identity to the report
              content. Your phone number is stored separately and is not included in exported data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Retention</h2>
            <p>
              Reports are retained for 36 months from the date of submission, after which they are
              archived in anonymised aggregate form. Photo files are retained for 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your rights</h2>
            <p>
              You may request deletion of any report linked to your session or phone number by
              contacting{' '}
              <a
                href="mailto:data@beacon.undp.org"
                className="text-[#006eb5] hover:underline"
              >
                data@beacon.undp.org
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Open source</h2>
            <p>
              Beacon is MIT licensed. The full source code, including data handling logic, is
              publicly available at{' '}
              <a
                href="https://github.com/ORIGIN-HQ/UNDP-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006eb5] hover:underline"
              >
                github.com/ORIGIN-HQ/UNDP-frontend
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p>
              For data requests, corrections, or deletion enquiries, contact{' '}
              <a
                href="mailto:data@beacon.undp.org"
                className="text-[#006eb5] hover:underline"
              >
                data@beacon.undp.org
              </a>
              . For general enquiries, visit{' '}
              <Link href="/contact" className="text-[#006eb5] hover:underline">
                our contact page
              </Link>
              .
            </p>
          </section>

        </div>
      </div>
    </PageShell>
  )
}
