'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { registerUser } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/\d/.test(password)) {
      setErrorMsg('Password must contain at least one numerical digit.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        role,
        organization_code: orgCode.trim() || undefined,
      });

      // Automatically sign in the user
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-vibha-slate-border shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-vibha-teal text-white flex items-center justify-center mx-auto text-xl font-extrabold shadow-sm">
            V
          </div>
          <h1 className="text-2xl font-bold text-vibha-navy tracking-tight">
            Create Your VIBHA Account
          </h1>
          <p className="text-xs text-vibha-slate-light">
            Join thousands of engineers mastering verifiable, production-grade technical skills.
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
          {/* Track Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-vibha-slate mb-2">
              Select Your Learning Track
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  role === 'STUDENT'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>College / Fresher</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('PROFESSIONAL_LEARNER')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  role === 'PROFESSIONAL_LEARNER'
                    ? 'border-vibha-teal bg-vibha-teal-subtle text-vibha-teal-dark shadow-sm'
                    : 'border-vibha-slate-border text-vibha-slate hover:bg-vibha-grey'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Working Professional</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ananya@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
                College Code (Optional)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value)}
                  placeholder="e.g. RVCE-01"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-vibha-navy mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-vibha-slate-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars with letters & numbers"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-white"
              />
            </div>
            <p className="text-[11px] text-vibha-slate-light mt-1">
              Minimum 8 characters containing letters and numbers.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account & Setting Session...</span>
              </>
            ) : (
              <span>Complete Registration</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-vibha-slate">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-vibha-navy hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
