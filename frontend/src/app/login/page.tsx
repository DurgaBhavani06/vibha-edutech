'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-vibha-slate-border shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-vibha-navy text-white flex items-center justify-center mx-auto text-xl font-extrabold shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-bold text-vibha-navy tracking-tight">
            Sign In to VIBHA
          </h1>
          <p className="text-xs text-vibha-slate-light">
            Access your course progress, labs, assessments, and cohort materials.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-vibha-navy">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-vibha-teal hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vibha-slate-light hover:text-vibha-navy"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-vibha-slate">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-semibold text-vibha-teal hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
