import React from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, Cpu, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function ForWorkingProfessionalsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Briefcase className="w-4 h-4" />
            <span>Senior Technical Upskilling</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            For Working Professionals
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Transition into higher-impact engineering roles. Master Cloud Architecture, Kubernetes, Distributed Systems, and AI Engineering through intensive weekend cohorts tailored for busy schedules.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-vibha-navy">
                Engineered for Practicing Developers & Tech Leads
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                If you are currently maintaining legacy codebases, stuck in manual testing, or aiming to transition into high-scale Cloud and AI engineering, our professional tracks deliver senior-level technical depth without disrupting your weekday employment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Cpu className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Distributed Systems & Scale</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Deep dives into event streaming with Kafka, distributed caching, partition tolerance, and database tuning.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Layers className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Cloud Native Infrastructure</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Terraform state management, multi-cluster Kubernetes deployments, Helm packaging, and Prometheus observability.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Cohort Features for Professionals
              </h3>
              <ul className="space-y-3 text-sm text-vibha-slate">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Weekend interactive sessions with recordings and transcribed notes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Async code reviews and 1-on-1 architecture discussions on Discord/Slack.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Corporate tax invoicing support for employer education reimbursements.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/courses?audience=working-professionals"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm"
              >
                <span>View Professional Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Professional Program Consultation
              </h3>
              <p className="text-xs text-vibha-slate-light">
                Connect with our senior faculty to evaluate cohort compatibility and syllabus requirements.
              </p>
              <EnquiryForm initialType="CORPORATE_TRAINING" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
