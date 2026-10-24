'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Award,
  ArrowRight,
  FileCode,
  Loader2,
  PlayCircle,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { fetchMyEnrollments, enrollInCourse } from '@/lib/lms';
import {
  fetchMyCertificates,
  claimCertificate,
  fetchMySubmissions,
  submitAssignment,
  fetchMyAttendance,
} from '@/lib/assessment';
import { EnrollmentResponse } from '@/types/lms';
import {
  Certificate,
  Submission,
  AttendanceResponse,
} from '@/types/assessment';

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attendance, setAttendance] = useState<AttendanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  // Claiming certificate state
  const [claimingCourseId, setClaimingCourseId] = useState<number | null>(null);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New assignment submission modal/state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [subCourseId, setSubCourseId] = useState<number>(1);
  const [subTitle, setSubTitle] = useState('');
  const [subGithub, setSubGithub] = useState('');
  const [subNotes, setSubNotes] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [enrData, certData, subData, attData] = await Promise.all([
        fetchMyEnrollments(token || undefined),
        fetchMyCertificates(token || undefined),
        fetchMySubmissions(token || undefined),
        fetchMyAttendance(token || undefined),
      ]);
      setEnrollments(enrData);
      setCertificates(certData);
      setSubmissions(subData);
      setAttendance(attData);
      if (enrData.length > 0) {
        setSubCourseId(enrData[0].course_id);
      }
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleQuickEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId, token || undefined);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleClaimCertificate = async (courseId: number) => {
    setClaimingCourseId(courseId);
    setClaimMessage(null);
    try {
      const cert = await claimCertificate(courseId, token || undefined);
      setClaimMessage({
        type: 'success',
        text: `Certificate awarded! Verification code: ${cert.certificate_code}`,
      });
      const updatedCerts = await fetchMyCertificates(token || undefined);
      setCertificates(updatedCerts);
    } catch (err: any) {
      setClaimMessage({
        type: 'error',
        text: err.message || 'Failed to claim certificate. Ensure all modules and quizzes are passed.',
      });
    } finally {
      setClaimingCourseId(null);
    }
  };

  const handleSubmitAssignmentForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim()) return;
    setIsSubmittingAssign(true);
    try {
      await submitAssignment(
        {
          course_id: subCourseId,
          title: subTitle,
          github_url: subGithub,
          notes: subNotes,
        },
        token || undefined
      );
      setShowSubmitModal(false);
      setSubTitle('');
      setSubGithub('');
      setSubNotes('');
      const updatedSubs = await fetchMySubmissions(token || undefined);
      setSubmissions(updatedSubs);
      alert('Assignment submitted successfully for mentor review!');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-light rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibha-teal/20 text-vibha-teal text-[11px] font-semibold uppercase tracking-wider">
            Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user?.full_name || 'Learner'}
          </h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Account: <span className="text-white font-mono">{user?.email}</span> • Status:{' '}
            <span className="text-vibha-teal font-semibold">Active Student</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/ai-tutor"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-colors shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-vibha-teal" />
            <span>AI Tutor & Assistant</span>
          </Link>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Assignment</span>
          </button>
          <Link
            href="/courses"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-vibha-navy bg-white hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Active Enrollments</div>
          <div className="text-2xl font-bold text-vibha-navy">
            {enrollments.filter((e) => e.status === 'ACTIVE').length} Tracks
          </div>
          <div className="text-[11px] text-vibha-teal font-medium">Verified by LMS</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Earned Certificates</div>
          <div className="text-2xl font-bold text-vibha-navy">{certificates.length} Verified</div>
          <div className="text-[11px] text-emerald-600 font-medium">Tamper-evident credentials</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Average Progress</div>
          <div className="text-2xl font-bold text-vibha-navy">
            {enrollments.length > 0
              ? `${Math.round(
                  enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) /
                    enrollments.length
                )}%`
              : '0%'}
          </div>
          <div className="text-[11px] text-vibha-slate-light">Across all curricula</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Submitted Projects</div>
          <div className="text-2xl font-bold text-vibha-navy">{submissions.length} PRs</div>
          <div className="text-[11px] text-vibha-slate-light">
            {submissions.filter((s) => s.status === 'GRADED').length} Graded by Mentors
          </div>
        </div>
      </div>

      {/* Claim Notification Toast */}
      {claimMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
            claimMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {claimMessage.type === 'success' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{claimMessage.text}</span>
          </div>
          <button
            onClick={() => setClaimMessage(null)}
            className="text-xs font-bold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-vibha-navy">My Active Learning Tracks</h2>
          {enrollments.length > 0 && (
            <span className="text-xs text-vibha-slate-light">
              {enrollments.length} Course{enrollments.length > 1 ? 's' : ''} Enrolled
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 border border-vibha-slate-border text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-vibha-teal mx-auto" />
            <p className="text-xs text-vibha-slate-light">Loading enrolled courses & progress...</p>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enr) => {
              const course = enr.course;
              const isEligibleForCert =
                enr.progress_percentage >= 100 || enr.status === 'COMPLETED';
              const hasCert = certificates.some((c) => c.course_id === enr.course_id);

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-vibha-teal-subtle text-vibha-teal-dark">
                        {course?.category || 'Engineering'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          enr.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {enr.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-vibha-navy">
                      {course?.title || `Course #${enr.course_id}`}
                    </h3>

                    <p className="text-xs text-vibha-slate-light line-clamp-2 leading-relaxed">
                      {course?.tagline || 'Hands-on project-centric engineering program.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-vibha-slate">Course Curriculum</span>
                        <span className="text-vibha-navy">{enr.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-vibha-grey rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-vibha-teal h-2 rounded-full transition-all duration-500"
                          style={{ width: `${enr.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-vibha-slate-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/assessments/1`}
                        className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Take Quiz
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEligibleForCert && !hasCert && (
                        <button
                          onClick={() => handleClaimCertificate(enr.course_id)}
                          disabled={claimingCourseId === enr.course_id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>
                            {claimingCourseId === enr.course_id ? 'Claiming...' : 'Claim Certificate'}
                          </span>
                        </button>
                      )}

                      <Link
                        href={
                          course?.slug
                            ? `/dashboard/courses/${course.slug}/lessons/1`
                            : `/courses`
                        }
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-vibha-navy text-white hover:bg-vibha-teal transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{enr.progress_percentage > 0 ? 'Continue' : 'Start'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-vibha-slate-border text-center space-y-4">
            <div className="w-12 h-12 bg-vibha-grey text-vibha-slate rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-vibha-navy">No Active Enrollments Yet</h3>
            <p className="text-xs text-vibha-slate max-w-md mx-auto leading-relaxed">
              Explore our project-centric curricula and enroll in a technical specialization today.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleQuickEnroll(1)}
                disabled={enrollingId === 1}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm flex items-center gap-2"
              >
                {enrollingId === 1 ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                <span>1-Click Enroll: Full-Stack Web</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Verified Certificates */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vibha-slate-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-vibha-navy">Official Verified Certificates</h3>
          </div>
          <Link
            href="/verify"
            className="text-xs text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
          >
            Public Credential Portal &rarr;
          </Link>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {c.certificate_code}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(c.issued_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{c.course_title}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Graduation Score: {c.grade_percentage || 100}%
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Authentic & Verified
                  </span>
                  <Link
                    href={`/verify/${c.certificate_code}`}
                    target="_blank"
                    className="font-bold text-teal-800 hover:underline inline-flex items-center gap-1"
                  >
                    View Credential <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">
            No certificates earned yet. Complete 100% of course lessons and pass the required assessments to claim your credential.
          </p>
        )}
      </div>

      {/* Section 3: Assignment Submissions History */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vibha-slate-border shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-vibha-navy">Project & Code Submissions</h3>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            + New Submission
          </button>
        </div>

        {submissions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div key={sub.id} className="py-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{sub.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      sub.status === 'GRADED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status} {sub.grade !== null && `• ${sub.grade}/100`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  <span>Track: {sub.course_title}</span>
                  {sub.github_url && (
                    <a
                      href={sub.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      Repo <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span>Submitted: {new Date(sub.created_at).toLocaleDateString()}</span>
                </div>

                {sub.trainer_feedback && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">
                      Trainer Feedback ({sub.graded_by_name || 'Mentor'}):
                    </strong>
                    {sub.trainer_feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">
            No projects submitted yet. Use the button above to submit your capstone or lab PR.
          </p>
        )}
      </div>

      {/* Section 4: Personal Batch Attendance */}
      {attendance.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vibha-slate-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-vibha-navy">Personal Cohort Attendance Record</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {attendance.map((att) => (
              <div key={att.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-900 block">{att.session_date}</span>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    att.status === 'PRESENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {att.status}
                </span>
                {att.remarks && (
                  <span className="block text-slate-400 text-[10px] mt-1 italic">{att.remarks}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Assignment Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Submit Assignment or Project</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitAssignmentForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Enrolled Course
                </label>
                <select
                  value={subCourseId}
                  onChange={(e) => setSubCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
                >
                  {enrollments.map((enr) => (
                    <option key={enr.course_id} value={enr.course_id}>
                      {enr.course?.title || `Course #${enr.course_id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Task Queue Capstone"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={subGithub}
                  onChange={(e) => setSubGithub(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Implementation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe key architecture patterns, design decisions, and setup instructions..."
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssign}
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmittingAssign ? 'Submitting...' : 'Submit to Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
