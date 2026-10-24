import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-vibha-slate hover:text-vibha-teal transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal-subtle text-vibha-teal-dark text-xs font-semibold uppercase tracking-wider">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Transparent Policies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-vibha-navy">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-vibha-slate-light">
          Last updated: October 2026
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-vibha-slate-border shadow-sm space-y-6 text-sm text-vibha-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">1. Student Course Registrations</h2>
          <p>
            We strive to provide total clarity before enrollment. For public cohort enrollments, learners may request a 100% refund up to 48 hours prior to the official batch orientation date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">2. Trial Period & Early Exit</h2>
          <p>
            If a learner attends the first scheduled lecture and determines the technical pace or prerequisites are unsuited to their current background, they may request a refund within 5 calendar days of the cohort start, minus a 10% administrative processing fee.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">3. Institutional & College Partnerships</h2>
          <p>
            Institutional contracts with partner colleges and universities are governed by the specific service level agreement (SLA) executed between VIBHA and the college administration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">4. Refund Processing Timelines</h2>
          <p>
            Approved refunds are credited to the original payment method within 7 to 10 business days. For refund requests, email <code className="text-vibha-teal font-mono">billing@vibha-edtech.com</code> with your enrolment reference code.
          </p>
        </section>
      </div>
    </div>
  );
}
