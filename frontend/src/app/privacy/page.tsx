import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-vibha-navy">
          Privacy Policy
        </h1>
        <p className="text-xs text-vibha-slate-light">
          Last updated: October 2026 • Effective immediately
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-vibha-slate-border shadow-sm space-y-6 text-sm text-vibha-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">1. Information We Collect</h2>
          <p>
            VIBHA EdTech Private Limited ("VIBHA", "we", "our") collects personal information you provide when submitting enquiries, registering for courses, or using our LMS platform. This may include your full name, email address, phone number, academic institution, organization name, and technical project submissions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">2. How We Use Your Information</h2>
          <p>
            We process your information strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Respond to program enquiries and provide academic consultation.</li>
            <li>Maintain student records, assessment scores, and attendance logs.</li>
            <li>Generate verifiable course completion certificates.</li>
            <li>Coordinate cohort schedules and provide LMS access credentials.</li>
            <li>Protect our platform against automated abuse, fraud, and spam.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">3. Data Sharing & Third-Party Providers</h2>
          <p>
            We do not sell, rent, or trade student or institutional data to third-party advertisers. Data is shared exclusively with essential infrastructure providers (such as transactional database hosting and cloud infrastructure) under strict confidentiality agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">4. Security Safeguards</h2>
          <p>
            We enforce industry-standard security protocols including HTTPS encryption in transit, salted password hashing, rate limiting, and role-based tenant isolation to protect learner records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">5. Contact Our Data Protection Team</h2>
          <p>
            For privacy inquiries or to exercise your data rights, contact us at <code className="text-vibha-teal font-mono">privacy@vibha-edtech.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
