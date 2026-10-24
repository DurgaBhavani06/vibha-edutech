import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-vibha-navy text-white pt-16 pb-12 border-t border-vibha-navy-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-vibha-navy-light/40">
          {/* Brand & Corporate Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vibha-teal flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
                V
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                VIBHA <span className="text-vibha-teal font-normal">EdTech</span>
              </span>
            </div>
            <p className="text-vibha-grey/80 text-sm leading-relaxed max-w-sm">
              VIBHA is a technical education and skilling organization committed to practical engineering competency, project-first pedagogy, and institutional partnerships.
            </p>
            <div className="pt-2 text-xs text-vibha-teal bg-vibha-navy-light/40 rounded-lg p-3 inline-block border border-vibha-teal/20">
              <span className="font-semibold text-white">Motto: </span>
              "Learn Skills. Build Projects. Grow Careers."
            </div>
          </div>

          {/* Audience Specific Programs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              Learner Tracks
            </h3>
            <ul className="space-y-2 text-sm text-vibha-grey/80">
              <li>
                <Link href="/for-students" className="hover:text-white transition-colors">
                  College Students
                </Link>
              </li>
              <li>
                <Link href="/for-freshers" className="hover:text-white transition-colors">
                  Fresh Graduates
                </Link>
              </li>
              <li>
                <Link href="/for-working-professionals" className="hover:text-white transition-colors">
                  Working Professionals
                </Link>
              </li>
              <li>
                <Link href="/for-colleges" className="hover:text-white transition-colors">
                  Partner Colleges
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  All Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Quality */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              Academic Standards
            </h3>
            <ul className="space-y-2 text-sm text-vibha-grey/80">
              <li>
                <Link href="/practical-projects" className="hover:text-white transition-colors">
                  Project-First Method
                </Link>
              </li>
              <li>
                <Link href="/trainers-and-mentors" className="hover:text-white transition-colors">
                  Faculty & Mentors
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition-colors font-medium text-vibha-teal">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Company Vision
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Corporate Enquiries
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Campus Proposals
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
              Direct Contact
            </h3>
            <div className="space-y-2 text-sm text-vibha-grey/80">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-vibha-teal mt-0.5 shrink-0" />
                <span>contact@vibha-edtech.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-vibha-teal mt-0.5 shrink-0" />
                <span>+91 80 4123 4567</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-vibha-teal mt-0.5 shrink-0" />
                <span>VIBHA Education Center, Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Footer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-vibha-grey/70">
          <div>
            &copy; {new Date().getFullYear()} VIBHA EdTech Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund" className="hover:text-white transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
