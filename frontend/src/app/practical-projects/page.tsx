import React from 'react';
import Link from 'next/link';
import { Terminal, Code, GitFork, ArrowRight, Layers, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

export default function PracticalProjectsPage() {
  const sampleProjects = [
    {
      title: "Distributed Financial Transaction Engine",
      category: "Enterprise Java & Distributed Systems",
      description: "High-concurrency account ledger microservice with idempotent transaction processing, audit trails, and Kafka event streaming.",
      techStack: ["Java 21", "Spring Boot", "Apache Kafka", "PostgreSQL", "Docker"],
      competencies: [
        "Distributed Locks & Idempotent Consumer",
        "Saga Orchestration for Multi-Step Transactions",
        "PostgreSQL Composite Indexing & Optimistic Locking",
        "Comprehensive Unit & Integration Test Suites"
      ]
    },
    {
      title: "B2B SaaS Collaborative Workspace Platform",
      category: "Modern Full-Stack Web Engineering",
      description: "Full-stack application featuring role-based access control, real-time collaboration via WebSockets, and transactional billing integration.",
      techStack: ["Next.js App Router", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
      competencies: [
        "Server Components & Streaming SSR",
        "Role-Based Authorization & Session Cookies",
        "Relational Data Normalization & Migrations",
        "Automated CI/CD Pipeline via GitHub Actions"
      ]
    },
    {
      title: "Multi-Region Zero-Downtime Infrastructure Suite",
      category: "Cloud Architecture & DevOps",
      description: "Terraform-automated VPC, managed Kubernetes cluster, blue-green deployment pipeline, and SSL-automated Ingress.",
      techStack: ["Terraform", "Kubernetes", "Helm", "Prometheus", "Grafana"],
      competencies: [
        "Infrastructure as Code State Isolation",
        "Ingress Controllers & Let's Encrypt TLS Automation",
        "Prometheus Alerting & Custom SLO Dashboards",
        "Zero-Downtime Rolling Deployment Strategies"
      ]
    },
    {
      title: "Domain-Specific Technical Knowledge RAG Assistant",
      category: "Data Science & AI Systems",
      description: "Contextual question-answering system using document chunking, embedding generation, semantic retrieval, and guardrail validation.",
      techStack: ["Python", "FastAPI", "Vector DB", "Pydantic", "Pytest"],
      competencies: [
        "Document Parsing & Chunking Strategies",
        "Vector Similarity Retrieval & Re-ranking",
        "Prompt Injection & Hallucination Guardrails",
        "FastAPI Asynchronous Microservice Serving"
      ]
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Terminal className="w-4 h-4" />
            <span>Pedagogy in Action</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Practical Project Standards
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            At VIBHA, projects are not cosmetic portfolio ornaments. Every project requires robust schemas, clean architecture, automated testing, and containerized deployment.
          </p>
        </div>
      </section>

      {/* Philosophy banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 border border-vibha-slate-border shadow-sm space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              The VIBHA Project Manifesto
            </span>
            <h2 className="text-2xl font-bold text-vibha-navy">
              What Separates a Real Project From a Tutorial Clone?
            </h2>
            <p className="text-sm text-vibha-slate leading-relaxed">
              Anyone can follow a step-by-step video to build a basic blog. Engineering interviews and real business software demand understanding failure scenarios, concurrency bugs, data integrity, and automated testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border space-y-2">
              <div className="font-bold text-sm text-vibha-navy flex items-center gap-2">
                <Database className="w-4 h-4 text-vibha-teal" />
                <span>Real Relational Schemas</span>
              </div>
              <p className="text-xs text-vibha-slate leading-relaxed">
                No untyped, unstructured mock objects. Learners write normalized PostgreSQL schemas, apply foreign keys, define indexes, and run migrations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border space-y-2">
              <div className="font-bold text-sm text-vibha-navy flex items-center gap-2">
                <Code className="w-4 h-4 text-vibha-teal" />
                <span>Automated Test Coverage</span>
              </div>
              <p className="text-xs text-vibha-slate leading-relaxed">
                Unit and API integration tests are mandatory requirements before any project milestone is approved by instructors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border space-y-2">
              <div className="font-bold text-sm text-vibha-navy flex items-center gap-2">
                <GitFork className="w-4 h-4 text-vibha-teal" />
                <span>Production Git Hygiene</span>
              </div>
              <p className="text-xs text-vibha-slate leading-relaxed">
                Semantic commits, informative pull request descriptions, and clean branch merges mirroring enterprise engineering teams.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-vibha-navy">
            Sample Capstone Projects Built Across Programs
          </h2>
          <p className="text-sm text-vibha-slate-light mt-1">
            These verified project specifications represent the graduation bar across our technical cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sampleProjects.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-7 border border-vibha-slate-border shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-vibha-teal-subtle text-vibha-teal-dark">
                  {p.category}
                </span>
                <h3 className="text-xl font-bold text-vibha-navy">
                  {p.title}
                </h3>
                <p className="text-sm text-vibha-slate leading-relaxed">
                  {p.description}
                </p>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-vibha-slate">
                    Key Technical Competencies Built:
                  </div>
                  <ul className="space-y-1.5 text-xs text-vibha-slate-light">
                    {p.competencies.map((comp, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vibha-teal shrink-0 mt-0.5" />
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-vibha-slate-border/60">
                <div className="text-[11px] font-semibold text-vibha-slate-light uppercase mb-2">
                  Architecture & Technologies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs bg-vibha-grey text-vibha-slate font-mono px-2.5 py-1 rounded border border-vibha-slate-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm"
          >
            <span>Explore Courses to Build These Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
