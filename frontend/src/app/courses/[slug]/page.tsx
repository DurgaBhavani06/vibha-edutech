import React from 'react';
import { notFound } from 'next/navigation';
import { fetchCourseBySlug } from '@/lib/api';
import EnquiryForm from '@/components/EnquiryForm';
import EnrollButton from '@/components/EnrollButton';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Laptop,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface CourseDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await fetchCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-16 pb-20">
      {/* 1. COURSE HEADER HERO */}
      <section className="bg-vibha-navy text-white pt-12 pb-20 border-b border-vibha-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-semibold text-vibha-grey/80 hover:text-vibha-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </Link>

          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal border border-vibha-teal/30">
                {course.category}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-vibha-navy-light text-vibha-grey">
                Level: {course.level}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded bg-vibha-navy-light text-vibha-grey">
                Target: {course.audience.replace('-', ' ')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-lg text-vibha-grey/90 leading-relaxed font-normal">
              {course.tagline}
            </p>

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-vibha-navy-light/40 border border-vibha-navy-light">
                <div className="flex items-center gap-2 text-vibha-teal text-xs font-semibold mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Duration</span>
                </div>
                <div className="text-sm font-bold">{course.duration_weeks} Weeks</div>
              </div>

              <div className="p-3 rounded-xl bg-vibha-navy-light/40 border border-vibha-navy-light">
                <div className="flex items-center gap-2 text-vibha-teal text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Commitment</span>
                </div>
                <div className="text-sm font-bold">{course.hours_per_week} hrs / week</div>
              </div>

              <div className="p-3 rounded-xl bg-vibha-navy-light/40 border border-vibha-navy-light">
                <div className="flex items-center gap-2 text-vibha-teal text-xs font-semibold mb-1">
                  <Laptop className="w-4 h-4" />
                  <span>Format</span>
                </div>
                <div className="text-xs font-medium truncate">{course.format}</div>
              </div>

              <div className="p-3 rounded-xl bg-vibha-navy-light/40 border border-vibha-navy-light">
                <div className="flex items-center gap-2 text-vibha-teal text-xs font-semibold mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Modules</span>
                </div>
                <div className="text-sm font-bold">{course.modules.length} Core Modules</div>
              </div>
            </div>

            <div className="pt-2">
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                className="bg-vibha-teal text-white hover:bg-vibha-teal-dark font-bold text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT + SIDEBAR ENQUIRY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-vibha-slate-border shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-vibha-navy">Course Overview</h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                {course.description}
              </p>

              <div className="pt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-vibha-slate-light">
                  Skills You Will Master
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {course.key_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-vibha-teal-subtle text-vibha-teal-dark font-medium px-3 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Prerequisites */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-vibha-slate-border shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-vibha-navy">Prerequisites & Eligibility</h2>
              <ul className="space-y-2.5">
                {course.prerequisites.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-vibha-slate">
                    <Check className="w-4 h-4 text-vibha-teal shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Syllabus Modules */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-vibha-navy">
                  Curriculum & Module Breakdown
                </h2>
                <p className="text-xs text-vibha-slate-light">
                  Structured learning units blending technical theory, live lab demonstrations, and implementation exercises.
                </p>
              </div>

              <div className="space-y-4">
                {course.modules.map((mod) => (
                  <div
                    key={mod.module_number}
                    className="bg-white rounded-2xl border border-vibha-slate-border shadow-sm p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                          Module {mod.module_number}
                        </span>
                        <h3 className="text-lg font-bold text-vibha-navy">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-vibha-slate-light leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    {/* Lessons in this module */}
                    <div className="pt-2 border-t border-vibha-slate-border/60 space-y-2">
                      <div className="text-[11px] font-semibold text-vibha-slate-light uppercase tracking-wider">
                        Included Lessons & Labs
                      </div>
                      <div className="space-y-2">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-vibha-grey/50 border border-vibha-slate-border/50 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-vibha-teal shrink-0" />
                              <span className="font-medium text-vibha-navy">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-vibha-slate-light font-mono text-[11px]">
                              <span className="uppercase px-1.5 py-0.5 rounded bg-white text-[10px]">
                                {lesson.type}
                              </span>
                              <span>{lesson.duration_min} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Capstone Projects Showcase */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 border border-vibha-slate-border shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                  Hands-On Engineering
                </span>
                <h2 className="text-xl font-bold text-vibha-navy">
                  Capstone Projects You Will Build
                </h2>
                <p className="text-xs text-vibha-slate-light">
                  Production-style repositories with multi-tier architectures and automated unit tests.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.projects.map((proj, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-5 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-vibha-navy">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-vibha-slate leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-vibha-slate-light uppercase mb-1">
                        Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {proj.tech_stack.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] bg-white text-vibha-slate border border-vibha-slate-border px-2 py-0.5 rounded font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Sticky Consultation Form (4 cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-2xl border border-vibha-slate-border shadow-sm p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                  Enrolment & Inquiries
                </span>
                <h3 className="text-lg font-bold text-vibha-navy">
                  Interested in this track?
                </h3>
                <p className="text-xs text-vibha-slate-light leading-relaxed">
                  Submit an enquiry below for upcoming cohort dates, syllabus downloads, or corporate batch pricing.
                </p>
              </div>

              <EnquiryForm
                initialCourseSlug={course.slug}
                initialType="STUDENT"
              />
            </div>

            {/* Quality Commitment Box */}
            <div className="bg-vibha-teal-subtle/50 rounded-2xl border border-vibha-teal/20 p-5 space-y-2 text-xs text-vibha-slate">
              <div className="font-bold text-vibha-teal-dark flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Academic Rigor</span>
              </div>
              <p className="leading-relaxed">
                VIBHA does not offer superficial completion shortcuts. Certificates are only awarded upon passing required project code evaluations and assessments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
