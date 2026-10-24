import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Target, HeartHandshake, ArrowRight, Award, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Corporate Mission & Integrity</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            About VIBHA EdTech
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Founded on the belief that genuine software engineering competence is built through hands-on practice, deep mental models, and uncompromising academic integrity.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Story */}
        <section className="bg-white rounded-2xl p-8 border border-vibha-slate-border shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
            Our Origin & Philosophy
          </span>
          <h2 className="text-2xl font-bold text-vibha-navy">
            Building the Anti-Hype Technical Learning Platform
          </h2>
          <div className="space-y-4 text-sm text-vibha-slate leading-relaxed">
            <p>
              In recent years, the online education market has become saturated with dramatic marketing promises: guarantees of astronomical starting salaries, effortless career pivots in 30 days, and superficial certificates given for merely clicking through video players.
            </p>
            <p>
              VIBHA was created as an intentional counterweight to this trend. We believe that software engineering is a demanding, rewarding craft requiring rigorous practice, relational thinking, architectural discipline, and constant code verification.
            </p>
            <p>
              Our motto is simple and honest: <strong className="text-vibha-navy">"Learn Skills. Build Projects. Grow Careers."</strong> We don't promise shortcuts; we deliver structured curricula, uncompromising code reviews, and measurable competency.
            </p>
          </div>
        </section>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-vibha-navy">Rigorous Standards</h3>
            <p className="text-xs text-vibha-slate leading-relaxed">
              Curricula designed around real business workloads, production testing frameworks, and maintainable software architectures.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-vibha-navy">Authentic Claims</h3>
            <p className="text-xs text-vibha-slate leading-relaxed">
              Zero fabricated placement rates, zero fake testimonials, and zero artificial marketing logos. Our reputation is built strictly on merit.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-vibha-navy">Verifiable Proof</h3>
            <p className="text-xs text-vibha-slate leading-relaxed">
              Every completed assessment, code submission, and certificate can be checked cryptographically on our public verification portal.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-vibha-grey/60 rounded-2xl p-8 border border-vibha-slate-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-vibha-navy">
              Want to see our curriculum in action?
            </h3>
            <p className="text-xs text-vibha-slate">
              Explore our complete collection of technical course syllabi and lab outlines.
            </p>
          </div>
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shrink-0"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
