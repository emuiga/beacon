import { PageShell } from '@/components/shared/PageShell'

export default function TermsPage() {
  return (
    <PageShell>
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-[#006eb5] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-10">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Intended use</h2>
            <p>
              Beacon is designed exclusively for humanitarian damage documentation following
              sudden-onset crises such as floods, earthquakes, wildfires, and conflicts.
              By using this application, you agree to submit only genuine, first-hand
              reports of infrastructure damage in affected areas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Prohibited conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-none flex flex-col gap-2 pl-0">
              {[
                'Submit false, fabricated, or misleading damage reports',
                'Upload content that is harmful, abusive, obscene, or illegal',
                'Attempt to identify individuals from photographs or report metadata',
                'Use the application for any commercial or non-humanitarian purpose',
                'Attempt to reverse-engineer, exploit, or disrupt the service',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 bg-[#006eb5] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">No warranty</h2>
            <p>
              Beacon is provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee
              continuous availability, accuracy of AI-assisted analysis, or completeness of data.
              Beacon is not a substitute for official emergency services or authoritative
              crisis information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Open source</h2>
            <p>
              Beacon is released under the MIT License. You are free to use, copy, modify,
              and distribute the source code subject to the terms of that licence. The source
              is available at{' '}
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data ownership</h2>
            <p>
              Reports submitted through Beacon become part of the UNDP crisis response
              dataset. By submitting a report you grant UNDP and authorised humanitarian
              partners the right to use, process, and share that data for crisis coordination
              and analysis. No personal identity is attached to anonymous submissions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Governing policies</h2>
            <p>
              Use of Beacon is subject to UNDP&apos;s{' '}
              <a
                href="https://www.undp.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006eb5] hover:underline"
              >
                Privacy Policy
              </a>{' '}
              and general terms of use. In the event of conflict between these terms and
              UNDP&apos;s organisational policies, UNDP&apos;s policies take precedence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Changes to these terms</h2>
            <p>
              We may update these terms from time to time. The date at the top of this page
              will reflect the most recent revision. Continued use of Beacon after an update
              constitutes acceptance of the revised terms.
            </p>
          </section>

        </div>
      </div>
    </PageShell>
  )
}
