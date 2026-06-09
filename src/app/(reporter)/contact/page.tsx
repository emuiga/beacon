import { PageShell } from '@/components/shared/PageShell'
import Link from 'next/link'
import { ExternalLink, GitBranch, Mail, AlertTriangle } from 'lucide-react'

export default function ContactPage() {
  return (
    <PageShell>
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-[#006eb5] uppercase tracking-widest mb-3">Contact</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in touch</h1>
        <p className="text-gray-500 text-lg mb-12 leading-relaxed">
          Beacon is an open source UNDP InnoCentive initiative. We do not operate a crisis hotline.
          For life-threatening emergencies, contact your local emergency services.
        </p>

        {/* Emergency notice */}
        <div className="border-l-4 border-red-500 pl-4 mb-12 bg-red-50 py-3 pr-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-700">
              <strong>Not a crisis hotline.</strong> Beacon collects damage reports for UNDP analysis.
              For emergencies, call your local emergency number.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Technical support */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Technical</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Bug reports &amp; feature requests</p>
                <a
                  href="https://github.com/ORIGIN-HQ/UNDP-frontend/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                  GitHub Issues
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Source code</p>
                <a
                  href="https://github.com/ORIGIN-HQ/UNDP-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                  ORIGIN-HQ/UNDP-frontend
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* UNDP */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">UNDP</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">General inquiries</p>
                <a
                  href="https://www.undp.org/contact-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  undp.org/contact-us
                </a>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Crisis response &amp; humanitarian</p>
                <a
                  href="https://www.undp.org/crisis-response"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  undp.org/crisis-response
                </a>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Data &amp; Privacy</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Data requests or deletion</p>
                <a
                  href="mailto:data@beacon.undp.org"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  data@beacon.undp.org
                </a>
              </div>
              <div>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* InnoCentive */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">About</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">UNDP InnoCentive Challenge</p>
                <a
                  href="https://www.undp.org/innocentive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#006eb5] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Build the Future of Crisis Mapping
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
