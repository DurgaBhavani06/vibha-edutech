'use client';

import React, { useState, useEffect } from 'react';
import { EnquiryType, EnquiryFormData, EnquirySubmitResponse } from '@/types';
import { submitEnquiry } from '@/lib/api';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  GraduationCap,
  Briefcase,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

interface EnquiryFormProps {
  initialType?: EnquiryType;
  initialCourseSlug?: string;
  className?: string;
}

export default function EnquiryForm({
  initialType = 'STUDENT',
  initialCourseSlug = '',
  className = '',
}: EnquiryFormProps) {
  const [enquiryType, setEnquiryType] = useState<EnquiryType>(initialType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgOrCollege, setOrgOrCollege] = useState('');
  const [courseSlug, setCourseSlug] = useState(initialCourseSlug);
  const [message, setMessage] = useState('');
  // Honeypot field (hidden from genuine users)
  const [honeypot, setHoneypot] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<EnquirySubmitResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialType) setEnquiryType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (initialCourseSlug) setCourseSlug(initialCourseSlug);
  }, [initialCourseSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic frontend validations
    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setErrorMsg('Please enter a valid phone number (7 to 15 digits).');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Please enter a descriptive message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    const payload: EnquiryFormData = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      enquiry_type: enquiryType,
      organization_or_college: orgOrCollege.trim() || undefined,
      course_slug: courseSlug.trim() || undefined,
      message: message.trim(),
      hp_token: honeypot || undefined,
    };

    try {
      const response = await submitEnquiry(payload);
      setSubmitResult(response);
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setOrgOrCollege('');
      setMessage('');
      setHoneypot('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceCode = () => {
    if (submitResult?.reference_code) {
      navigator.clipboard.writeText(submitResult.reference_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getOrgFieldLabel = () => {
    switch (enquiryType) {
      case 'COLLEGE_TRAINING':
        return 'College / Institution Name';
      case 'CORPORATE_TRAINING':
        return 'Company / Organization Name';
      case 'STUDENT':
        return 'College / University (Optional)';
      default:
        return 'Organization / Company (Optional)';
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-vibha-slate-border shadow-sm p-6 sm:p-8 ${className}`}>
      {submitResult ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 bg-vibha-teal-subtle text-vibha-teal-dark rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-vibha-navy">Enquiry Received</h3>
          <p className="text-vibha-slate text-sm max-w-md mx-auto leading-relaxed">
            {submitResult.message}
          </p>

          <div className="bg-vibha-grey p-4 rounded-xl max-w-sm mx-auto flex items-center justify-between border border-vibha-slate-border">
            <div className="text-left">
              <div className="text-[11px] font-semibold uppercase text-vibha-slate-light tracking-wider">
                Reference Code
              </div>
              <div className="text-lg font-mono font-bold text-vibha-navy">
                {submitResult.reference_code}
              </div>
            </div>
            <button
              onClick={copyReferenceCode}
              type="button"
              className="p-2 text-vibha-slate hover:text-vibha-teal transition-colors rounded-lg bg-white border border-vibha-slate-border/60"
              title="Copy reference code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-vibha-slate-light">
            Please quote this reference code for future follow-ups with our admissions or corporate relations team.
          </p>

          <button
            type="button"
            onClick={() => setSubmitResult(null)}
            className="mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold text-vibha-navy bg-vibha-grey hover:bg-vibha-slate-border transition-colors"
          >
            Submit Another Enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enquiry Type Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vibha-slate mb-2">
              Select Enquiry Purpose
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setEnquiryType('STUDENT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  enquiryType === 'STUDENT'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border bg-white text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span>Student Course</span>
              </button>

              <button
                type="button"
                onClick={() => setEnquiryType('COLLEGE_TRAINING')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  enquiryType === 'COLLEGE_TRAINING'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border bg-white text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1" />
                <span>College Training</span>
              </button>

              <button
                type="button"
                onClick={() => setEnquiryType('CORPORATE_TRAINING')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  enquiryType === 'CORPORATE_TRAINING'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border bg-white text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1" />
                <span>Corporate</span>
              </button>

              <button
                type="button"
                onClick={() => setEnquiryType('GENERAL_CONTACT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  enquiryType === 'GENERAL_CONTACT'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border bg-white text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <Mail className="w-4 h-4 mb-1" />
                <span>General Contact</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                {getOrgFieldLabel()}
              </label>
              <input
                type="text"
                value={orgOrCollege}
                onChange={(e) => setOrgOrCollege(e.target.value)}
                placeholder={
                  enquiryType === 'COLLEGE_TRAINING'
                    ? 'e.g. R.V. College of Engineering'
                    : 'e.g. Infosys / TCS / Self'
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
          </div>

          {/* Course Selection (if applicable) */}
          {(enquiryType === 'STUDENT' || courseSlug) && (
            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Interested Course Track (Optional)
              </label>
              <select
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white text-vibha-slate"
              >
                <option value="">-- Choose Course Track --</option>
                <option value="fullstack-web-engineering">Modern Full-Stack Web Engineering</option>
                <option value="cloud-architecture-devops">Cloud Architecture & DevOps Engineering</option>
                <option value="data-science-ai-engineering">Applied Data Science & Machine Learning Systems</option>
                <option value="enterprise-java-microservices">Enterprise Java & Spring Boot Microservices</option>
                <option value="embedded-systems-iot-engineering">Embedded Systems & IoT Hardware Engineering</option>
              </select>
            </div>
          )}

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Requirements / Message <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your specific learning goals, batch requirements, or questions..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
            />
          </div>

          {/* Hidden Anti-Spam Honeypot Field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp_token">Leave this field blank</label>
            <input
              type="text"
              id="hp_token"
              name="hp_token"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validating & Logging Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Enquiry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
