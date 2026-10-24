'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchBatches,
  fetchBatchDetail,
  markBatchAttendance,
  fetchBatchAttendanceSummary,
  fetchPendingSubmissions,
  gradeSubmission,
} from '@/lib/assessment';
import {
  Batch,
  BatchDetail,
  BatchAttendanceSummary,
  Submission,
  AttendanceStatus,
} from '@/types/assessment';
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { generateAssessmentQuestions } from '@/lib/ai';
import { GeneratedQuestion, DifficultyLevel } from '@/types/ai';

export default function TrainerDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'batches' | 'attendance' | 'grading' | 'ai-questions'>('batches');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Question Generator states
  const [genCourseId, setGenCourseId] = useState<number>(1);
  const [genTopic, setGenTopic] = useState<string>('FastAPI Asynchronous Architecture & SQLAlchemy ORM');
  const [genDifficulty, setGenDifficulty] = useState<DifficultyLevel>('INTERMEDIATE');
  const [genCount, setGenCount] = useState<number>(3);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [approvedIndices, setApprovedIndices] = useState<number[]>([]);

  // Attendance states
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<number, { status: AttendanceStatus; remarks: string }>
  >({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<BatchAttendanceSummary | null>(null);

  // Grading states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeStatus, setGradeStatus] = useState<'GRADED' | 'REJECTED'>('GRADED');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [bList, pSubs] = await Promise.all([
        fetchBatches(),
        fetchPendingSubmissions(),
      ]);
      setBatches(bList);
      setSubmissions(pSubs);
      if (bList.length > 0) {
        setSelectedBatchId(bList[0].id);
        loadBatchInfo(bList[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatchInfo(batchId: number) {
    try {
      const [detail, summary] = await Promise.all([
        fetchBatchDetail(batchId),
        fetchBatchAttendanceSummary(batchId),
      ]);
      setBatchDetail(detail);
      setAttendanceSummary(summary);

      // Pre-populate attendance records for students in roster
      if (detail?.students) {
        const initialMap: Record<number, { status: AttendanceStatus; remarks: string }> = {};
        detail.students.forEach((s) => {
          initialMap[s.student_id] = { status: 'PRESENT', remarks: '' };
        });
        setAttendanceRecords(initialMap);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleBatchChange(bId: number) {
    setSelectedBatchId(bId);
    setAttendanceSuccess(null);
    loadBatchInfo(bId);
  }

  async function handleSaveAttendance() {
    if (!selectedBatchId || !batchDetail) return;
    setSavingAttendance(true);
    setAttendanceSuccess(null);
    try {
      const recordsPayload = batchDetail.students.map((s) => ({
        student_id: s.student_id,
        status: attendanceRecords[s.student_id]?.status || 'PRESENT',
        remarks: attendanceRecords[s.student_id]?.remarks || '',
      }));

      await markBatchAttendance(selectedBatchId, attendanceDate, recordsPayload);
      setAttendanceSuccess(`Attendance for ${attendanceDate} recorded successfully!`);

      // Refresh attendance summary
      const updatedSummary = await fetchBatchAttendanceSummary(selectedBatchId);
      setAttendanceSummary(updatedSummary);
    } catch (err: any) {
      alert(err.message || 'Error saving attendance');
    } finally {
      setSavingAttendance(false);
    }
  }

  async function handleGradeSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSub) return;
    setGradingSaving(true);
    setGradeSuccess(null);
    try {
      await gradeSubmission(selectedSub.id, {
        status: gradeStatus,
        grade: gradeScore,
        trainer_feedback: gradeFeedback,
      });
      setGradeSuccess(`Submission #${selectedSub.id} graded successfully.`);
      setSelectedSub(null);
      // Refresh pending submissions
      const updatedSubs = await fetchPendingSubmissions();
      setSubmissions(updatedSubs);
    } catch (err: any) {
      alert(err.message || 'Error grading submission');
    } finally {
      setGradingSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-light rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibha-teal/20 text-vibha-teal text-[11px] font-semibold uppercase tracking-wider">
            Faculty & Trainer Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Trainer Portal: {user?.full_name}</h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Assigned Batches • Attendance Tracking • Assignment Grading Queue
          </p>
        </div>

        {/* Quick stats badges */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="block text-2xl font-bold text-vibha-teal">{batches.length}</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Batches</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="block text-2xl font-bold text-amber-400">{submissions.length}</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300">Pending Reviews</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'batches'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Assigned Batches & Rosters
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'attendance'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Attendance Entry & Analytics
        </button>

        <button
          onClick={() => setActiveTab('grading')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'grading'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Assignment Grading Queue ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('ai-questions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ai-questions'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-vibha-teal" /> AI Question Generator
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
            Trainer Review
          </span>
        </button>
      </div>

      {/* TAB 1: Assigned Batches */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batches List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Active Cohorts ({batches.length})
            </h3>
            <div className="space-y-3">
              {batches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleBatchChange(b.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedBatchId === b.id
                      ? 'border-vibha-teal bg-teal-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <span className="text-xs text-slate-500">{b.student_count} enrolled</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{b.course_title}</p>
                </div>
              ))}
              {batches.length === 0 && !loading && (
                <p className="text-xs text-slate-500 italic p-4 bg-white rounded-xl border">
                  No cohorts currently assigned.
                </p>
              )}
            </div>
          </div>

          {/* Student Roster View */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {batchDetail ? batchDetail.name : 'Select a Batch'}
                </h3>
                <p className="text-xs text-slate-500">
                  Course: {batchDetail?.course_title || 'N/A'} • Cohort Code: {batchDetail?.code || 'N/A'}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                {batchDetail?.students?.length || 0} Students in Roster
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchDetail?.students?.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-teal-600" />
                        {s.full_name}
                      </td>
                      <td className="py-3 text-slate-600">{s.email}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(s.enrolled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!batchDetail?.students || batchDetail.students.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                        No students enrolled in this cohort yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance Entry & Analytics */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Batch & Date Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Selected Cohort
                </label>
                <select
                  value={selectedBatchId || ''}
                  onChange={(e) => handleBatchChange(Number(e.target.value))}
                  className="px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-teal-600"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={savingAttendance || !batchDetail?.students?.length}
              className="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm shadow-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {savingAttendance ? 'Saving...' : 'Save Attendance Log'}
            </button>
          </div>

          {attendanceSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {attendanceSuccess}
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">
              Student Attendance Entry ({batchDetail?.students?.length || 0} Learners)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Attendance Status</th>
                    <th className="pb-3">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchDetail?.students?.map((s) => {
                    const currentRecord = attendanceRecords[s.student_id] || {
                      status: 'PRESENT',
                      remarks: '',
                    };

                    return (
                      <tr key={s.student_id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-900">
                          {s.full_name}
                          <span className="block text-[11px] font-normal text-slate-400">{s.email}</span>
                        </td>

                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map(
                              (statusOption) => (
                                <button
                                  key={statusOption}
                                  type="button"
                                  onClick={() =>
                                    setAttendanceRecords((prev) => ({
                                      ...prev,
                                      [s.student_id]: {
                                        ...prev[s.student_id],
                                        status: statusOption,
                                      },
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                    currentRecord.status === statusOption
                                      ? statusOption === 'PRESENT'
                                        ? 'bg-emerald-600 text-white'
                                        : statusOption === 'ABSENT'
                                        ? 'bg-rose-600 text-white'
                                        : statusOption === 'LATE'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-indigo-600 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {statusOption}
                                </button>
                              )
                            )}
                          </div>
                        </td>

                        <td className="py-3">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={currentRecord.remarks}
                            onChange={(e) =>
                              setAttendanceRecords((prev) => ({
                                ...prev,
                                [s.student_id]: {
                                  ...prev[s.student_id],
                                  remarks: e.target.value,
                                },
                              }))
                            }
                            className="px-2.5 py-1 border border-slate-200 rounded text-xs w-full max-w-xs focus:ring-1 focus:ring-teal-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {(!batchDetail?.students || batchDetail.students.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                        Please select a cohort with enrolled students.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Attendance Summary */}
          {attendanceSummary && attendanceSummary.student_stats.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
                Cohort Attendance History & Compliance
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Total Recorded Sessions: {attendanceSummary.total_dates_recorded}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceSummary.student_stats.map((stat) => (
                  <div
                    key={stat.student_id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{stat.full_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stat.attendance_percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {stat.attendance_percentage}%
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex gap-3">
                      <span>Present: {stat.present_count}</span>
                      <span>Absent: {stat.absent_count}</span>
                      <span>Late: {stat.late_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Assignment Grading Queue */}
      {activeTab === 'grading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Pending Submissions ({submissions.length})
            </h3>

            {gradeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                {gradeSuccess}
              </div>
            )}

            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub);
                    setGradeScore(sub.grade || 85);
                    setGradeFeedback(sub.trainer_feedback || '');
                    setGradeSuccess(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedSub?.id === sub.id
                      ? 'border-vibha-teal bg-teal-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {sub.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{sub.title}</h4>
                  <p className="text-xs text-slate-600">By: {sub.student_name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{sub.course_title}</p>
                </div>
              ))}

              {submissions.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                  No submissions currently awaiting review. Queue is clear!
                </div>
              )}
            </div>
          </div>

          {/* Grading Inspection & Review Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            {selectedSub ? (
              <form onSubmit={handleGradeSubmission} className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    Project Review
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{selectedSub.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted by {selectedSub.student_name} ({selectedSub.student_email})
                  </p>
                </div>

                {/* Submission Links & Notes */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  {selectedSub.github_url && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">GitHub Repository:</span>
                      <a
                        href={selectedSub.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {selectedSub.github_url} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {selectedSub.submission_url && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Live Demo / Deployed Link:</span>
                      <a
                        href={selectedSub.submission_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {selectedSub.submission_url} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {selectedSub.notes && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1">Student Notes:</span>
                      <p className="text-slate-600 bg-white p-3 rounded border border-slate-200 leading-relaxed">
                        {selectedSub.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Grading Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Outcome Decision
                    </label>
                    <select
                      value={gradeStatus}
                      onChange={(e) => setGradeStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 font-medium"
                    >
                      <option value="GRADED">Accept & Grade (Passed)</option>
                      <option value="REJECTED">Reject / Needs Re-work</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Score (Scale 0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Trainer Technical Feedback
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide constructive feedback on codebase structure, edge cases handled, and performance..."
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gradingSaving}
                    className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {gradingSaving ? 'Saving...' : 'Submit Evaluation & Feedback'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">Select a submission from the pending list on the left to grade.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AI Question Generator (Human-in-the-Loop) */}
      {activeTab === 'ai-questions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vibha-teal" />
                  AI Assessment Question Generator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate draft multiple-choice assessment questions. All questions require trainer review before publishing.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Human-in-the-Loop Enforced
              </span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!genTopic.trim() || genLoading) return;
                setGenLoading(true);
                setGenError(null);
                try {
                  const resp = await generateAssessmentQuestions({
                    course_id: genCourseId,
                    topic: genTopic,
                    difficulty: genDifficulty,
                    count: genCount,
                  });
                  setGeneratedQuestions(resp.questions);
                  setApprovedIndices([]);
                } catch (err: any) {
                  setGenError(err.message || 'Failed to generate assessment questions');
                } finally {
                  setGenLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Course
                  </label>
                  <select
                    value={genCourseId}
                    onChange={(e) => setGenCourseId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-600 font-medium"
                  >
                    <option value={1}>Course 1: Full-Stack Web Development</option>
                    <option value={2}>Course 2: Cloud Native DevOps</option>
                    <option value={3}>Course 3: Applied AI & Machine Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-600 font-medium"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Number of Questions
                  </label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-600 font-medium"
                  >
                    <option value={1}>1 Question</option>
                    <option value={2}>2 Questions</option>
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                  </select>
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={genLoading || !genTopic.trim()}
                    className="w-full px-4 py-2 bg-vibha-teal text-white rounded-lg text-xs font-bold hover:bg-vibha-teal-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {genLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Draft Questions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Topic or Competency
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g., FastAPI Dependency Injection, Database Connection Pooling, JWT Cookie Authentication"
                  className="w-full px-3 py-2 border rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </form>

            {genError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{genError}</span>
              </div>
            )}
          </div>

          {/* Generated Questions List */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Drafted Questions ({generatedQuestions.length})
                </h4>
                <div className="text-xs text-slate-500">
                  Approved: <span className="font-bold text-teal-700">{approvedIndices.length}</span> of {generatedQuestions.length}
                </div>
              </div>

              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => {
                  const isApproved = approvedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isApproved
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                              Q{idx + 1}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {q.difficulty}
                            </span>
                            {isApproved ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                Trainer Approved
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Review Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900 mt-1">{q.question_text}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isApproved) {
                              setApprovedIndices(approvedIndices.filter((i) => i !== idx));
                            } else {
                              setApprovedIndices([...approvedIndices, idx]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                            isApproved
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-teal-600 hover:text-white'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isApproved ? 'Approved' : 'Approve Question'}</span>
                        </button>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correct_index;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                isCorrect
                                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium'
                                  : 'border-slate-200 bg-slate-50/50 text-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="font-bold text-slate-800 text-[11px]">Explanation & Pedagogical Rationale:</div>
                        <p className="text-[11px] leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
