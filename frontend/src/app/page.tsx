import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Cpu,
  Database,
  Terminal,
  Building2,
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Award,
  Users,
} from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import EnquiryForm from '@/components/EnquiryForm';
import { fetchCourses } from '@/lib/api';

export default async function HomePage() {
  const coursesData = await fetchCourses();
  const featuredCourses = coursesData.items.slice(0, 3);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-vibha-navy text-white pt-20 pb-28 overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibha-navy-light text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Technical Education</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Learn Skills. <br />
                <span className="text-vibha-teal">Build Projects.</span> <br />
                Grow Careers.
              </h1>

              <p className="text-lg text-vibha-grey/90 leading-relaxed max-w-2xl font-normal">
                VIBHA EdTech bridges academic theory and engineering reality. We deliver rigorous, hands-on software engineering, cloud infrastructure, and AI systems programs for college students, institutions, freshers, and working professionals.
              </p>

              {/* Verified Value Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-vibha-navy-light/60 border border-vibha-navy-light">
                  <div className="text-vibha-teal font-bold text-base">Project-First</div>
                  <div className="text-xs text-vibha-grey/70">Production codebases & code reviews</div>
                </div>
                <div className="p-3 rounded-lg bg-vibha-navy-light/60 border border-vibha-navy-light">
                  <div className="text-vibha-teal font-bold text-base">Institution Ready</div>
                  <div className="text-xs text-vibha-grey/70">Partner college semester tracks</div>
                </div>
                <div className="p-3 rounded-lg bg-vibha-navy-light/60 border border-vibha-navy-light">
                  <div className="text-vibha-teal font-bold text-base">Transparent</div>
                  <div className="text-xs text-vibha-grey/70">Real skills without false guarantees</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/courses"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-vibha-navy bg-white hover:bg-vibha-teal hover:text-white transition-all shadow-md flex items-center gap-2"
                >
                  <span>Explore Course Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-all border border-vibha-teal shadow-md"
                >
                  Talk to an Academic Advisor
                </Link>
              </div>
            </div>

            {/* Quick Hero Enquiry Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-7 text-vibha-navy shadow-2xl border border-vibha-slate-border">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                    Admissions & Campus Inquiries
                  </span>
                  <h3 className="text-xl font-bold text-vibha-navy mt-1">
                    Request Program Curriculum
                  </h3>
                  <p className="text-xs text-vibha-slate-light mt-1">
                    Connect with our curriculum directors for syllabus outlines, batch options, or college partnerships.
                  </p>
                </div>
                <EnquiryForm initialType="STUDENT" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUDIENCE-SPECIFIC SERVICE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
            Tailored Pathways
          </span>
          <h2 className="text-3xl font-extrabold text-vibha-navy sm:text-4xl">
            Designed for Every Stage of Technical Growth
          </h2>
          <p className="text-base text-vibha-slate">
            Whether you are on a college campus, stepping into the job market, or scaling enterprise microservices, our tracks are structured for measurable engineering competence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Students */}
          <div className="bg-white rounded-2xl p-7 border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-vibha-navy group-hover:text-vibha-teal transition-colors">
                For College Students
              </h3>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Transform textbook theory into applied capability. Build complex final-year projects, understand real runtime environments, and master core computer science foundations.
              </p>
              <ul className="space-y-2 text-xs text-vibha-slate-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Hands-on lab assignments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Architecture & Git best practices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Verified project portfolio</span>
                </li>
              </ul>
            </div>
            <Link
              href="/for-students"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vibha-teal hover:text-vibha-teal-dark"
            >
              <span>Explore Student Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Partner Colleges */}
          <div className="bg-white rounded-2xl p-7 border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-vibha-navy group-hover:text-vibha-teal transition-colors">
                For Partner Colleges
              </h3>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Empower your department with industry-aligned semester workshops, faculty development modules, standardized project evaluations, and LMS progress analytics.
              </p>
              <ul className="space-y-2 text-xs text-vibha-slate-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Curriculum alignment with UGC/AICTE</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>College LMS batch dashboards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>On-campus & virtual bootcamps</span>
                </li>
              </ul>
            </div>
            <Link
              href="/for-colleges"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vibha-teal hover:text-vibha-teal-dark"
            >
              <span>Institutional Partnerships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Freshers */}
          <div className="bg-white rounded-2xl p-7 border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-vibha-navy group-hover:text-vibha-teal transition-colors">
                For Freshers
              </h3>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Bridge the transition from graduation to employment. Code alongside seasoned mentors, submit PRs, resolve bugs in existing repositories, and pass technical interviews.
              </p>
              <ul className="space-y-2 text-xs text-vibha-slate-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Production codebase immersion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Mock technical architectural drills</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Verifiable Git commit track record</span>
                </li>
              </ul>
            </div>
            <Link
              href="/for-freshers"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vibha-teal hover:text-vibha-teal-dark"
            >
              <span>Fresher Acceleration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 4: Working Professionals */}
          <div className="bg-white rounded-2xl p-7 border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-vibha-navy group-hover:text-vibha-teal transition-colors">
                For Professionals
              </h3>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Level up your engineering career. Transition into Cloud, Kubernetes, Distributed Systems, or Machine Learning Engineering with weekend cohorts designed for working schedules.
              </p>
              <ul className="space-y-2 text-xs text-vibha-slate-light pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Weekend & flexible evening labs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>High-scale distributed systems</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-vibha-teal shrink-0" />
                  <span>Advanced architecture case studies</span>
                </li>
              </ul>
            </div>
            <Link
              href="/for-working-professionals"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-vibha-teal hover:text-vibha-teal-dark"
            >
              <span>Professional Upskilling</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PRACTICAL LEARNING BENEFITS / METHODOLOGY */}
      <section className="bg-vibha-grey/60 py-20 border-y border-vibha-slate-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                Our Educational Methodology
              </span>
              <h2 className="text-3xl font-extrabold text-vibha-navy sm:text-4xl leading-tight">
                Engineering Competence Over Passive Video Watching
              </h2>
              <p className="text-sm text-vibha-slate leading-relaxed">
                Passive tutorials do not create confident developers. VIBHA adheres to a rigorous, lab-driven learning framework tested across universities and development teams.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-vibha-teal text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vibha-navy">Grounded Mental Models</h4>
                    <p className="text-xs text-vibha-slate-light mt-0.5 leading-relaxed">
                      Deep conceptual grounding in protocols, memory management, concurrency, and database internals before touching abstractions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-vibha-teal text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vibha-navy">Mandatory Code Reviews</h4>
                    <p className="text-xs text-vibha-slate-light mt-0.5 leading-relaxed">
                      Learners push PRs on Git. Instructors review code readability, modularity, edge case handling, and automated test coverage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-vibha-teal text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vibha-navy">Multi-Component Capstone Projects</h4>
                    <p className="text-xs text-vibha-slate-light mt-0.5 leading-relaxed">
                      Projects are not generic todo apps. Every capstone connects databases, APIs, authentication, testing, and container deployment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/practical-projects"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-vibha-navy hover:text-vibha-teal transition-colors"
                >
                  <span>See How Projects Are Structured</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Architecture diagram showcase */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-vibha-slate-border shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-vibha-slate-border">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-vibha-teal" />
                    <span className="font-mono text-xs font-semibold text-vibha-navy">
                      VIBHA_CURRICULUM_PIPELINE.sh
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Production Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border/70 space-y-1.5">
                    <div className="text-xs font-bold text-vibha-navy flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-vibha-teal" />
                      <span>Code Cleanliness & Static Analysis</span>
                    </div>
                    <p className="text-xs text-vibha-slate-light leading-relaxed">
                      ESLint, Prettier, typing discipline, and architectural boundaries strictly enforced in code reviews.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border/70 space-y-1.5">
                    <div className="text-xs font-bold text-vibha-navy flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-vibha-teal" />
                      <span>Relational Schema Modeling</span>
                    </div>
                    <p className="text-xs text-vibha-slate-light leading-relaxed">
                      ACID compliance, normalization, foreign keys, composite indexes, and migration strategies.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border/70 space-y-1.5">
                    <div className="text-xs font-bold text-vibha-navy flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-vibha-teal" />
                      <span>Containerized Deployments</span>
                    </div>
                    <p className="text-xs text-vibha-slate-light leading-relaxed">
                      Multi-stage Docker builds, environment secret isolation, and production health check endpoints.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border/70 space-y-1.5">
                    <div className="text-xs font-bold text-vibha-navy flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-vibha-teal" />
                      <span>Automated Test Coverage</span>
                    </div>
                    <p className="text-xs text-vibha-slate-light leading-relaxed">
                      Unit tests, API integration tests, and end-to-end flows executed in automated CI workflows.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-vibha-teal-subtle/40 border border-vibha-teal/20 text-xs text-vibha-slate flex items-center justify-between">
                  <span>Targeted outcome: Confident, autonomous engineers capable of shipping business software.</span>
                  <Link href="/courses" className="font-semibold text-vibha-teal-dark hover:underline shrink-0 ml-2">
                    Browse Courses &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED COURSES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              Featured Programs
            </span>
            <h2 className="text-3xl font-extrabold text-vibha-navy">
              Industry-Aligned Technical Curricula
            </h2>
            <p className="text-sm text-vibha-slate max-w-xl">
              Verified sample course syllabi illustrating VIBHA's standard of academic rigor and lab depth.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-vibha-navy border border-vibha-slate-border hover:bg-vibha-grey transition-colors shrink-0"
          >
            <span>View All {coursesData.total} Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* 5. GENUINE COMPANY INFORMATION & VALUES */}
      <section className="bg-vibha-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              The VIBHA Commitment
            </span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Transparent, Ethical, Real-World Education
            </h2>
            <p className="text-sm text-vibha-grey/80 leading-relaxed">
              We founded VIBHA to counteract widespread marketing exaggeration in technical education. We do not manufacture fake placement records or superficial certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-vibha-navy-light/40 border border-vibha-navy-light space-y-3">
              <div className="w-10 h-10 rounded-lg bg-vibha-teal/20 text-vibha-teal flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">No Fabricated Claims</h3>
              <p className="text-xs text-vibha-grey/80 leading-relaxed">
                We do not guarantee 100% placements or display unverified testimonials. Our reputation rests on real learner competency, documented source code, and institutional trust.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-vibha-navy-light/40 border border-vibha-navy-light space-y-3">
              <div className="w-10 h-10 rounded-lg bg-vibha-teal/20 text-vibha-teal flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Merit-Based Certificates</h3>
              <p className="text-xs text-vibha-grey/80 leading-relaxed">
                Certificates are earned through verifiable assessment passing scores and evaluated project repositories. Every certificate includes an authenticity verification hash.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-vibha-navy-light/40 border border-vibha-navy-light space-y-3">
              <div className="w-10 h-10 rounded-lg bg-vibha-teal/20 text-vibha-teal flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Practicing Educators</h3>
              <p className="text-xs text-vibha-grey/80 leading-relaxed">
                Our faculty and trainers have proven industry engineering and mentoring backgrounds. They bring actual production failure modes and engineering patterns into the classroom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-vibha-navy">
            Clear Answers for Prospective Learners & Institutions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-vibha-slate-border shadow-sm space-y-2">
            <h3 className="text-base font-bold text-vibha-navy flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-vibha-teal shrink-0" />
              <span>How are VIBHA courses delivered?</span>
            </h3>
            <p className="text-sm text-vibha-slate leading-relaxed pl-6">
              Courses are delivered through a hybrid structure combining interactive live sessions, daily code labs, structured module quizzes, and git-based project submissions with instructor review.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-vibha-slate-border shadow-sm space-y-2">
            <h3 className="text-base font-bold text-vibha-navy flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-vibha-teal shrink-0" />
              <span>How can engineering colleges partner with VIBHA?</span>
            </h3>
            <p className="text-sm text-vibha-slate leading-relaxed pl-6">
              Engineering colleges can request custom semester-embedded workshops, value-added skill courses, or faculty development programs. We configure dedicated institutional LMS portals with batch tracking and attendance reporting.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-vibha-slate-border shadow-sm space-y-2">
            <h3 className="text-base font-bold text-vibha-navy flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-vibha-teal shrink-0" />
              <span>What are the prerequisites for enrollment?</span>
            </h3>
            <p className="text-sm text-vibha-slate leading-relaxed pl-6">
              Prerequisites vary by course level. Foundational tracks require basic familiarity with at least one programming language and logical problem solving, while advanced Cloud and Microservices tracks require prior engineering experience. Specific requirements are detailed on each course page.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-vibha-slate-border shadow-sm space-y-2">
            <h3 className="text-base font-bold text-vibha-navy flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-vibha-teal shrink-0" />
              <span>Are completion certificates recognized and verifiable?</span>
            </h3>
            <p className="text-sm text-vibha-slate leading-relaxed pl-6">
              Yes. Each VIBHA certificate contains a unique cryptographic verification identifier that employers and institutions can check directly on our public verification portal to confirm project completion and assessment scores.
            </p>
          </div>
        </div>
      </section>

      {/* 7. ENQUIRY / CONSULTATION CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-light rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-vibha-navy-light">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              Get Started Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Ready to Upgrade Your Engineering Capabilities?
            </h2>
            <p className="text-sm text-vibha-grey/80 leading-relaxed">
              Submit an enquiry to speak directly with an academic mentor. We help learners and institutions select the right technical curriculum.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-vibha-navy bg-white hover:bg-vibha-teal hover:text-white transition-all shadow-md"
            >
              Submit an Enquiry
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-all border border-vibha-teal shadow-md"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
