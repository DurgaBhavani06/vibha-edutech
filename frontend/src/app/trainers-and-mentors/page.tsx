import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, ShieldCheck, CheckCircle2, Award, Terminal, Code } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function TrainersAndMentorsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Users className="w-4 h-4" />
            <span>Faculty & Mentorship Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Trainers & Engineering Mentors
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Learn directly from practicing software architects, DevOps practitioners, and backend engineers. We enforce strict qualification standards for everyone who steps into a VIBHA classroom.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-vibha-navy">
                Our Rigorous Mentor Selection Criteria
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Many online learning platforms employ recent graduates who have never worked on production systems to teach complex subjects. At VIBHA, our pedagogical charter requires demonstrated industry competence and active codebase contributions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-vibha-navy">
                    Production Systems Experience
                  </h3>
                  <p className="text-xs text-vibha-slate leading-relaxed">
                    Trainers must possess hands-on professional experience shipping and operating real-world software, databases, or cloud infrastructure.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-vibha-navy">
                    Pedagogical Ability & Patience
                  </h3>
                  <p className="text-xs text-vibha-slate leading-relaxed">
                    Technical skill alone is not enough. Our instructors are evaluated for clarity, empathy, structured problem deconstruction, and the ability to explain complex abstractions simply.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-vibha-navy">
                    Commitment to Rigorous Code Reviews
                  </h3>
                  <p className="text-xs text-vibha-slate leading-relaxed">
                    Instructors allocate dedicated office hours for line-by-line pull request reviews, discussing trade-offs, security implications, and algorithmic complexity.
                  </p>
                </div>
              </div>
            </div>

            {/* Transparent Note */}
            <div className="p-6 rounded-2xl bg-vibha-grey/60 border border-vibha-slate-border space-y-3">
              <h3 className="text-base font-bold text-vibha-navy flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-vibha-teal" />
                <span>Transparent Educator Engagement</span>
              </h3>
              <p className="text-xs text-vibha-slate leading-relaxed">
                Rather than publishing inflated corporate claims, our trainer profiles, verified technical backgrounds, and syllabus contributions are transparently presented upon enrollment and institution proposal requests.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Interested in Teaching or Mentoring?
              </h3>
              <p className="text-xs text-vibha-slate-light">
                Are you an experienced software engineer passionate about technical education? Join our adjunct faculty or guest mentor network.
              </p>
              <EnquiryForm initialType="GENERAL_CONTACT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
