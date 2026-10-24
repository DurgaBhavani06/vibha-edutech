'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Building2,
  Briefcase,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [audienceDropdown, setAudienceDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
    setIsOpen(false);
    router.push('/');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return 'Admin';
      case 'TRAINER':
        return 'Trainer';
      case 'COLLEGE_COORDINATOR':
        return 'College Rep';
      case 'PROFESSIONAL_LEARNER':
        return 'Pro Learner';
      default:
        return 'Student';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-vibha-slate-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-lg bg-vibha-navy flex items-center justify-center text-white shadow-sm group-hover:bg-vibha-teal transition-colors">
              <span className="font-extrabold text-xl tracking-tight text-white">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-vibha-navy group-hover:text-vibha-teal transition-colors">
                VIBHA <span className="text-vibha-teal font-medium">EdTech</span>
              </span>
              <span className="text-[11px] text-vibha-slate-light font-medium tracking-wide uppercase">
                Skills • Projects • Careers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Home
            </Link>

            <Link
              href="/courses"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/courses')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Courses
            </Link>

            {/* Audience Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAudienceDropdown(!audienceDropdown)}
                onBlur={() => setTimeout(() => setAudienceDropdown(false), 200)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/for-')
                    ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                    : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
                }`}
                aria-expanded={audienceDropdown}
              >
                <span>Programs By Audience</span>
                <ChevronDown className="w-4 h-4 text-vibha-slate-light" />
              </button>

              {audienceDropdown && (
                <div className="absolute left-0 mt-2 w-64 rounded-lg bg-white border border-vibha-slate-border shadow-lg py-2 z-50">
                  <Link
                    href="/for-students"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-vibha-slate hover:bg-vibha-grey hover:text-vibha-navy"
                  >
                    <GraduationCap className="w-4 h-4 text-vibha-teal" />
                    <div>
                      <div className="font-medium">For College Students</div>
                      <div className="text-xs text-vibha-slate-light">Core CS & Project Mentorship</div>
                    </div>
                  </Link>

                  <Link
                    href="/for-colleges"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-vibha-slate hover:bg-vibha-grey hover:text-vibha-navy"
                  >
                    <Building2 className="w-4 h-4 text-vibha-teal" />
                    <div>
                      <div className="font-medium">For Partner Colleges</div>
                      <div className="text-xs text-vibha-slate-light">Institutional Training & Faculty Dev</div>
                    </div>
                  </Link>

                  <Link
                    href="/for-freshers"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-vibha-slate hover:bg-vibha-grey hover:text-vibha-navy"
                  >
                    <BookOpen className="w-4 h-4 text-vibha-teal" />
                    <div>
                      <div className="font-medium">For Freshers</div>
                      <div className="text-xs text-vibha-slate-light">Bridge Theory to Engineering Jobs</div>
                    </div>
                  </Link>

                  <Link
                    href="/for-working-professionals"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-vibha-slate hover:bg-vibha-grey hover:text-vibha-navy"
                  >
                    <Briefcase className="w-4 h-4 text-vibha-teal" />
                    <div>
                      <div className="font-medium">For Working Professionals</div>
                      <div className="text-xs text-vibha-slate-light">Cloud, DevOps & Systems Upskilling</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/practical-projects"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/practical-projects')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Projects
            </Link>

            <Link
              href="/trainers-and-mentors"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/trainers-and-mentors')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Trainers
            </Link>

            <Link
              href="/verify"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/verify')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Verify Credential
            </Link>

            <Link
              href="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-vibha-teal bg-vibha-teal-subtle/50'
                  : 'text-vibha-slate hover:text-vibha-navy hover:bg-vibha-grey'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* User Auth CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  onBlur={() => setTimeout(() => setUserDropdown(false), 200)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-vibha-slate-border hover:bg-vibha-grey transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-vibha-navy text-white flex items-center justify-center font-bold text-xs">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-vibha-navy leading-tight truncate max-w-[120px]">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] text-vibha-teal font-semibold">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-vibha-slate-light" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-vibha-slate-border shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-vibha-slate-border/50">
                      <div className="text-xs text-vibha-slate-light truncate">{user.email}</div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-vibha-navy hover:bg-vibha-grey"
                    >
                      <LayoutDashboard className="w-4 h-4 text-vibha-teal" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/ai-tutor"
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-vibha-navy hover:bg-vibha-grey"
                    >
                      <Sparkles className="w-4 h-4 text-vibha-teal" />
                      <span>AI Tutor & RAG</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-vibha-navy hover:text-vibha-teal transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-vibha-teal hover:bg-vibha-teal-dark shadow-sm transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-vibha-navy hover:text-vibha-teal hover:bg-vibha-grey focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-vibha-slate-border px-4 pt-2 pb-6 space-y-2">
          {user && (
            <div className="p-3 mb-2 rounded-xl bg-vibha-grey/60 border border-vibha-slate-border flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-vibha-navy">{user.full_name}</div>
                <div className="text-xs text-vibha-teal font-semibold">{getRoleBadge(user.role)}</div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs font-semibold rounded bg-vibha-navy text-white"
              >
                Dashboard
              </Link>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
          >
            Home
          </Link>
          <Link
            href="/courses"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
          >
            Course Catalog
          </Link>

          <div className="pt-2 pb-1 border-t border-vibha-slate-border/50">
            <span className="px-3 text-xs font-semibold text-vibha-slate-light uppercase tracking-wider">
              Audience Programs
            </span>
            <div className="mt-1 pl-2 space-y-1">
              <Link
                href="/for-students"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-vibha-slate hover:bg-vibha-grey"
              >
                For College Students
              </Link>
              <Link
                href="/for-colleges"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-vibha-slate hover:bg-vibha-grey"
              >
                For Partner Colleges
              </Link>
              <Link
                href="/for-freshers"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-vibha-slate hover:bg-vibha-grey"
              >
                For Freshers
              </Link>
              <Link
                href="/for-working-professionals"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-1.5 rounded-md text-sm text-vibha-slate hover:bg-vibha-grey"
              >
                For Working Professionals
              </Link>
            </div>
          </div>

          <div className="pt-2 pb-1 border-t border-vibha-slate-border/50">
            <Link
              href="/practical-projects"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
            >
              Practical Projects
            </Link>
            <Link
              href="/trainers-and-mentors"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
            >
              Trainers & Mentors
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
            >
              About VIBHA
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-vibha-navy hover:bg-vibha-grey"
            >
              Contact & Enquiries
            </Link>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-vibha-navy bg-vibha-grey"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-vibha-teal"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
