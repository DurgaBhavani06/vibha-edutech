import React from 'react';
import Link from 'next/link';
import { Code, ArrowRight, GitPullRequest, Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function ForFreshersPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Code className="w-4 h-4" />
            <span>Graduate Employment Acceleration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            For Fresh Graduates & Job Seekers
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Stand out in competitive technical evaluations by mastering production software engineering standards, clean code architecture, and verifiable system design.
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-vibha-navy">
                Overcoming the "Fresher Paradox"
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Companies seek candidates with real engineering experience, but graduates rarely have access to production systems. VIBHA simulates an enterprise software development environment where freshers work directly on multi-tier codebases, participate in sprint cycles, and deploy live applications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <GitPullRequest className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Sprint & PR Workflows</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Learn to read existing codebases, write clear PR descriptions, address code review feedback, and use automated linters.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Terminal className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Realistic Technical Interviews</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Weekly code walkthroughs and machine coding rounds that evaluate architectural decisions and bug troubleshooting under time limits.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Our Honest Approach to Career Growth
              </h3>
              <p className="text-sm text-vibha-slate leading-relaxed">
                VIBHA does not sell "100% Guaranteed Job" marketing illusions. We focus 100% of our energy on turning you into an engineer who can genuinely write clean, maintainable, tested software. When your skills are demonstrable in code, interviews take care of themselves.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/courses?audience=freshers"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm"
              >
                <span>View Fresher-Focused Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Fresher Career Consultation
              </h3>
              <p className="text-xs text-vibha-slate-light">
                Submit an inquiry to speak with an engineering mentor about which technology track fits your background.
              </p>
              <EnquiryForm initialType="STUDENT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
