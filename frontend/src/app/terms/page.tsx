import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Use</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-vibha-navy">
          Terms of Service
        </h1>
        <p className="text-xs text-vibha-slate-light">
          Last updated: October 2026
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-vibha-slate-border shadow-sm space-y-6 text-sm text-vibha-slate leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the VIBHA EdTech website, LMS platform, or educational programs, you agree to comply with and be bound by these Terms of Service. If you are entering into these terms on behalf of a college or corporate entity, you represent that you possess appropriate authorization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">2. Academic Integrity & Code of Conduct</h2>
          <p>
            Learners must complete assessment quizzes, code assignments, and project submissions honestly. Plagiarism, distribution of answer keys, or automated submission scripts will result in immediate termination of LMS access and forfeiture of certificate eligibility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">3. Intellectual Property Rights</h2>
          <p>
            All course materials, syllabi, curriculum slides, and instructional videos are the intellectual property of VIBHA EdTech. Code created independently by learners during capstone projects remains the property of the respective learner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">4. Certificate Verification & Revocation</h2>
          <p>
            VIBHA retains the right to revoke any certificate if it is determined that a student engaged in academic misconduct, identity fraud, or unauthorized assessment assistance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-vibha-navy">5. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India, with exclusive jurisdiction in the courts of Bengaluru, Karnataka.
          </p>
        </section>
      </div>
    </div>
  );
}
