import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, ShieldCheck, CheckCircle2, BarChart3, Users, Award } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function ForCollegesPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Building2 className="w-4 h-4" />
            <span>Institutional Skilling Partnerships</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            For Partner Colleges & Universities
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Collaborate with VIBHA to integrate modern industry-standard software engineering workshops, faculty development, and dedicated LMS tracking into your institution.
          </p>
        </div>
      </section>

      {/* Details & Institutional Proposal Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-vibha-navy">
                Institutional Partnership Pillars
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                VIBHA partners with progressive engineering colleges, autonomous institutions, and polytechnics to enhance campus placement readiness through rigorous, syllabus-complementing curricula.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <BarChart3 className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Dedicated College LMS</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  College coordinators receive an organization portal to monitor student cohort attendance, assignment evaluations, and completion metrics.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Users className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Faculty Enablement</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Empower college educators with train-the-trainer workshops on modern cloud tools, containerized development, and automated testing frameworks.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Award className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Semester Credit Alignment</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Modular programs structured to align smoothly with university autonomous curriculum electives, mini-projects, or internship credits.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <ShieldCheck className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Verifiable Accreditation</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Standardized, fraud-proof certificate issuance with cryptographic verification codes for institutional NAAC/NBA documentation.
                </p>
              </div>
            </div>

            <div className="bg-vibha-teal-subtle/50 rounded-2xl p-6 border border-vibha-teal/20 space-y-3">
              <h3 className="text-base font-bold text-vibha-navy">
                Transparent Institutional Engagement Model
              </h3>
              <p className="text-xs text-vibha-slate leading-relaxed">
                We believe in straightforward collaboration. No inflated promises or opaque pricing. We present clear syllabi, measurable attendance tracking, and transparent progress reports directly accessible by department heads and college management.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Request a College Partnership Proposal
              </h3>
              <p className="text-xs text-vibha-slate-light">
                Submit your institution's requirements. Our academic directors will coordinate an in-depth curriculum presentation.
              </p>
              <EnquiryForm initialType="COLLEGE_TRAINING" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
