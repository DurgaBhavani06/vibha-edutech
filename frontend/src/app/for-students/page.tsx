import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowRight, BookOpen, Code, Terminal, CheckCircle2 } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function ForStudentsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <GraduationCap className="w-4 h-4" />
            <span>Student Skilling Pathway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            For College Students
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Move beyond textbook memorization and exam cramming. Build production-grade code, understand real developer workflows, and graduate with genuine technical confidence.
          </p>
        </div>
      </section>

      {/* Content + Consultation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-vibha-navy">
                Why Campus Engineering Requires a Practical Shift
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Most university curricula focus heavily on theoretical computer science without offering sufficient exposure to real debugging, distributed architectures, continuous integration, or team-based Git workflows. VIBHA bridges that exact divide.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Code className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Hands-On Labs</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Interactive daily programming exercises with instant unit test verification and peer code discussions.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-2">
                <Terminal className="w-5 h-5 text-vibha-teal" />
                <h3 className="text-base font-bold text-vibha-navy">Git & Terminal Fluency</h3>
                <p className="text-xs text-vibha-slate leading-relaxed">
                  Work in branch workflows, create descriptive PRs, conduct code reviews, and resolve merge conflicts.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-vibha-slate-border space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                What You Gain as a VIBHA Student Learner
              </h3>
              <ul className="space-y-3 text-sm text-vibha-slate">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>A clean GitHub portfolio with multi-container, fully documented projects.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Deep problem-solving mastery in relational databases, indexing, and REST APIs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Direct mentorship from senior software engineers working in enterprise environments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                  <span>Verifiable certificate of engineering accomplishment upon project evaluation.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/courses?audience=students"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm"
              >
                <span>Browse Student-Recommended Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-vibha-navy">
                Student Consultation & Guidance
              </h3>
              <p className="text-xs text-vibha-slate-light">
                Fill in your details to discuss semester schedules, weekend batches, or syllabus alignment.
              </p>
              <EnquiryForm initialType="STUDENT" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
