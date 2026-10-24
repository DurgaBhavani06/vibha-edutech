'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, Award, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Please provide a valid certificate verification code.');
      return;
    }
    router.push(`/verify/${encodeURIComponent(clean)}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-teal-700" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            VIBHA Credential Verification
          </h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Verify the authenticity and status of official certificates issued by VIBHA EdTech.
            Every certificate features a cryptographically secure verification code.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Certificate Verification Code
              </label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  placeholder="e.g. VIB-CERT-2026-A1B2C3D4"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-sm tracking-wider uppercase text-slate-900"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Verify Credential Authenticity
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Certificates are issued strictly upon 100% course completion and verified assessment passage.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Real-time verification against server-side relational database records.</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
          >
            ← Return to VIBHA EdTech Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
