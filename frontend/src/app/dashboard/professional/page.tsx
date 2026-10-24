'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Calendar, Cpu, Layers, GitPullRequest, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-dark rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibha-teal/20 text-vibha-teal text-[11px] font-semibold uppercase tracking-wider">
            Professional Engineering Track
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Role: <span className="text-vibha-teal font-semibold">Working Professional</span> • Weekend Cohort
          </p>
        </div>

        <Link
          href="/courses/cloud-architecture-devops"
          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-vibha-navy bg-white hover:bg-vibha-teal hover:text-white transition-colors shrink-0 shadow-sm"
        >
          View Active Cohort Syllabus
        </Link>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-vibha-navy">Current Architecture Track</h3>
          <p className="text-xs text-vibha-slate leading-relaxed">
            Cloud Architecture, Kubernetes Orchestration & Observability Suite.
          </p>
          <div className="text-xs font-mono text-vibha-teal">Next Session: Saturday 10:00 AM IST</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-vibha-navy">Code Review Queue</h3>
          <p className="text-xs text-vibha-slate leading-relaxed">
            PR #14: Terraform VPC Subnet Modularization with S3 Remote State.
          </p>
          <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold inline-block">
            Approved by Lead Architect
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-vibha-navy">Tax Invoice & Employer Reimbursement</h3>
          <p className="text-xs text-vibha-slate leading-relaxed">
            Download your corporate GST invoice and learning agreement for HR reimbursement.
          </p>
          <button className="text-xs font-semibold text-vibha-navy hover:text-vibha-teal underline text-left">
            Download Invoice PDF
          </button>
        </div>
      </div>
    </div>
  );
}
