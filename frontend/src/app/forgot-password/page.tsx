'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; dev_reset_url?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const data = await requestPasswordReset(email.trim());
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to process reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-vibha-slate-border shadow-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-vibha-slate-light hover:text-vibha-navy"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-vibha-navy">
            Reset Your Password
          </h1>
          <p className="text-xs text-vibha-slate-light">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-vibha-teal-subtle text-vibha-teal-dark rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-vibha-slate leading-relaxed">
              {result.message}
            </p>

            {/* In local dev mode, show direct reset link for convenience */}
            {result.dev_reset_url && (
              <div className="p-3 bg-vibha-grey rounded-xl border border-vibha-slate-border text-left space-y-2">
                <div className="text-[11px] font-semibold text-vibha-teal uppercase tracking-wider">
                  Development Mode Helper:
                </div>
                <Link
                  href={result.dev_reset_url}
                  className="block text-xs font-mono text-vibha-navy hover:underline break-all"
                >
                  Click here to set new password &rarr;
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-vibha-navy text-white hover:bg-vibha-teal"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-vibha-navy hover:bg-vibha-teal transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <span>Request Password Reset</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
