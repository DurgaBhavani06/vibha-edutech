'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { verifyCertificatePublic } from '@/lib/assessment';
import { CertificateVerification } from '@/types/assessment';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  Calendar,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Printer,
} from 'lucide-react';

export default function CertificateVerificationDetailPage() {
  const params = useParams();
  const code = String(params?.code || '');
  const [data, setData] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      verifyCertificatePublic(code)
        .then(setData)
        .catch(() =>
          setData({
            valid: false,
            certificate_code: code,
            is_revoked: false,
            message: 'Unable to connect to verification server.',
          })
        )
        .finally(() => setLoading(false));
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Check another certificate code
          </Link>
          {data?.valid && !data.is_revoked && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg bg-white shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print Certificate
            </button>
          )}
        </div>

        {/* Certificate Card */}
        {data?.valid && !data.is_revoked ? (
          <div className="bg-white rounded-2xl border-4 border-teal-800/20 shadow-xl overflow-hidden p-8 sm:p-12 relative print:border-none print:shadow-none">
            {/* Header / Brand */}
            <div className="text-center pb-8 border-b border-slate-200">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Authentic Credential
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                VIBHA EdTech
              </h2>
              <p className="text-xs uppercase tracking-widest text-teal-700 font-semibold mt-1">
                Certificate of Technical Mastery
              </p>
            </div>

            {/* Certificate Body */}
            <div className="py-8 text-center space-y-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                This officially acknowledges that
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight text-teal-950">
                {data.student_name}
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                has successfully completed all required modules, rigorous hands-on projects, and verified technical assessments in
              </p>
              <div className="inline-block p-3 px-6 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-lg font-bold text-slate-900">{data.course_title}</h3>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400 font-medium">Issued Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {data.issued_at}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-slate-400 font-medium">Verification Code</span>
                <span className="font-mono font-bold text-teal-800 tracking-wider">
                  {data.certificate_code}
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-[11px] text-slate-400">
              Verified live via VIBHA EdTech Central Identity Registry. Tamper-evident digital issuance.
            </div>
          </div>
        ) : data?.is_revoked ? (
          <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-lg p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Certificate Revoked
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
              This Certificate Is No Longer Valid
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Official record for <strong className="text-slate-900">{data.student_name}</strong> in{' '}
              <strong className="text-slate-900">{data.course_title}</strong> was formally revoked by the platform administrator.
            </p>
            {data.revocation_reason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 text-left max-w-md mx-auto mb-6">
                <span className="font-bold block mb-1">Reason for Revocation:</span>
                {data.revocation_reason}
              </div>
            )}
            <span className="font-mono text-xs text-slate-400 block">
              Code: {data.certificate_code}
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Certificate Code</h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              No active or historical certificate record could be located matching code{' '}
              <span className="font-mono font-bold text-slate-800">{code}</span>. Please verify the code and re-check.
            </p>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-medium"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
