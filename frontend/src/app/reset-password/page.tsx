'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { confirmPasswordReset } from '@/lib/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token.trim()) {
      setErrorMsg('Password reset token is missing from URL.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setErrorMsg('New password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(token.trim(), newPassword);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-vibha-slate-border shadow-sm">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-vibha-navy">
          Set New Password
        </h1>
        <p className="text-xs text-vibha-slate-light">
          Enter a strong, secure password for your VIBHA account.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-vibha-navy">
            Password Reset Successful
          </h3>
          <p className="text-xs text-vibha-slate">
            You can now sign in to your dashboard with your new password.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-vibha-teal text-white hover:bg-vibha-teal-dark shadow-sm"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters with numbers"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Confirm & Update Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-vibha-slate-light">
            <Loader2 className="w-6 h-6 animate-spin text-vibha-teal mx-auto mb-2" />
            <span>Loading recovery form...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
