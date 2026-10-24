'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Users,
  Calendar,
  Award,
  FileText,
  Download,
  PlusCircle,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  ShieldCheck,
  Edit3,
  Loader2,
  AlertCircle,
  BookOpen,
  Send,
} from 'lucide-react';
import {
  fetchMyCollegeProfile,
  updateCollegeProfile,
  fetchCollegeStudents,
  fetchCollegeBatches,
  createCollegeBatch,
  fetchCollegePerformanceReport,
  getCollegeComplianceCsvExportUrl,
  fetchCollegeTrainingRequests,
  submitCollegeTrainingRequest,
} from '@/lib/college';
import { fetchCourses } from '@/lib/api';
import {
  CollegeStudent,
  CollegePerformanceReport,
  TrainingRequest,
} from '@/types/college';
import { Batch } from '@/types/assessment';
import { Organization, Course } from '@/types';

export default function CollegeDashboard() {
  const { user, token } = useAuth();

  const [org, setOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'batches' | 'students' | 'reports' | 'proposals'>('batches');
  const [loading, setLoading] = useState(true);

  // Data states
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<CollegeStudent[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [report, setReport] = useState<CollegePerformanceReport | null>(null);
  const [proposals, setProposals] = useState<TrainingRequest[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  // Modal: Edit Profile
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editWebsite, setEditWebsite] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);

  // Modal: Create Batch
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [batchCourseId, setBatchCourseId] = useState<number>(1);
  const [batchMaxStudents, setBatchMaxStudents] = useState<number>(60);
  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchEndDate, setBatchEndDate] = useState('');
  const [creatingBatch, setCreatingBatch] = useState(false);

  // Modal: Create Proposal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalCourseId, setProposalCourseId] = useState<number | undefined>(undefined);
  const [proposalAudience, setProposalAudience] = useState('B.Tech Final & Pre-Final Year');
  const [proposalStudents, setProposalStudents] = useState<number>(60);
  const [proposalDate, setProposalDate] = useState('');
  const [proposalMode, setProposalMode] = useState('HYBRID');
  const [proposalNotes, setProposalNotes] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  useEffect(() => {
    loadCollegeDashboard();
  }, [token]);

  async function loadCollegeDashboard() {
    setLoading(true);
    try {
      const orgProfile = await fetchMyCollegeProfile(token || undefined);
      setOrg(orgProfile);

      if (orgProfile) {
        setEditWebsite(orgProfile.website || '');
        setEditPhone(orgProfile.contact_phone || '');
        setEditAddress(orgProfile.address || '');

        const [bList, sList, repData, propList, cResponse] = await Promise.all([
          fetchCollegeBatches(orgProfile.id, token || undefined),
          fetchCollegeStudents(orgProfile.id, undefined, token || undefined),
          fetchCollegePerformanceReport(orgProfile.id, token || undefined),
          fetchCollegeTrainingRequests(orgProfile.id, token || undefined),
          fetchCourses(),
        ]);

        const courses = cResponse.items;
        setBatches(bList);
        setStudents(sList);
        setReport(repData);
        setProposals(propList);
        setAvailableCourses(courses);
        if (courses.length > 0) {
          setBatchCourseId(courses[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    const res = await fetchCollegeStudents(org.id, studentSearch, token || undefined);
    setStudents(res);
  }

  async function handleSaveOrgProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSavingOrg(true);
    try {
      const updated = await updateCollegeProfile(
        org.id,
        {
          website: editWebsite,
          contact_phone: editPhone,
          address: editAddress,
        },
        token || undefined
      );
      setOrg(updated);
      setShowEditOrgModal(false);
      alert('College profile updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setCreatingBatch(true);
    try {
      await createCollegeBatch(
        org.id,
        {
          name: batchName,
          code: batchCode,
          course_id: batchCourseId,
          max_students: batchMaxStudents,
          start_date: batchStartDate ? new Date(batchStartDate).toISOString() : undefined,
          end_date: batchEndDate ? new Date(batchEndDate).toISOString() : undefined,
        },
        token || undefined
      );
      setShowCreateBatchModal(false);
      setBatchName('');
      setBatchCode('');
      // Refresh batches & report
      const [updatedBatches, updatedReport] = await Promise.all([
        fetchCollegeBatches(org.id, token || undefined),
        fetchCollegePerformanceReport(org.id, token || undefined),
      ]);
      setBatches(updatedBatches);
      setReport(updatedReport);
      alert('Campus batch created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create batch');
    } finally {
      setCreatingBatch(false);
    }
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSubmittingProposal(true);
    try {
      await submitCollegeTrainingRequest(
        org.id,
        {
          title: proposalTitle,
          course_id: proposalCourseId,
          target_audience: proposalAudience,
          estimated_students: proposalStudents,
          preferred_start_date: proposalDate || undefined,
          training_mode: proposalMode,
          notes: proposalNotes,
        },
        token || undefined
      );
      setShowProposalModal(false);
      setProposalTitle('');
      setProposalNotes('');
      const updatedProps = await fetchCollegeTrainingRequests(org.id, token || undefined);
      setProposals(updatedProps);
      alert('Semester training proposal submitted for academic approval!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  }

  const handleDownloadCsv = () => {
    if (!org) return;
    const downloadUrl = getCollegeComplianceCsvExportUrl(org.id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${org.code}_NAAC_NBA_Compliance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-light rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibha-teal/20 text-vibha-teal text-[11px] font-semibold uppercase tracking-wider">
            Institutional Partner Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            {org ? org.name : 'College Coordinator Console'}
            {org && (
              <button
                onClick={() => setShowEditOrgModal(true)}
                title="Edit Organization Profile"
                className="text-xs p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Coordinator: <span className="text-white font-semibold">{user?.full_name}</span> • Code:{' '}
            <span className="font-mono text-vibha-teal font-bold">{org?.code || 'CAMPUS-01'}</span> • Type:{' '}
            <span className="text-white font-medium">{org?.type || 'COLLEGE'}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-vibha-navy bg-white hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-vibha-teal" />
            <span>Request Semester Batch</span>
          </button>
          <button
            onClick={() => setShowCreateBatchModal(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Campus Cohort</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Active Campus Batches</div>
          <div className="text-2xl font-bold text-vibha-navy">{batches.length} Cohorts</div>
          <div className="text-[11px] text-vibha-teal font-medium">Tenant Isolated</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Authorized Students</div>
          <div className="text-2xl font-bold text-vibha-navy">{students.length} Learners</div>
          <div className="text-[11px] text-slate-500 font-medium">Registered with institution</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Average Attendance</div>
          <div className="text-2xl font-bold text-vibha-navy">
            {report?.average_attendance_percentage || 0}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Accreditation verified</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Certificates Issued</div>
          <div className="text-2xl font-bold text-vibha-navy">
            {report?.total_certificates_issued || 0} Earned
          </div>
          <div className="text-[11px] text-teal-700 font-medium">Tamper-evident verification</div>
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
          <Calendar className="w-4 h-4" /> Campus Batches ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'students'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Authorized Students ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> NAAC / NBA Reports
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'proposals'
              ? 'border-vibha-teal text-vibha-teal-dark font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Training Proposals ({proposals.length})
        </button>
      </div>

      {/* TAB 1: Campus Batches */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Campus Cohorts & Schedules</h3>
            <button
              onClick={() => setShowCreateBatchModal(true)}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              + Create New Cohort
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => (
              <div
                key={b.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{b.name}</h4>
                  <p className="text-xs text-slate-500">{b.course_title}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Enrolled Roster:</span>
                    <strong className="text-slate-900">
                      {b.student_count} / {b.max_students}
                    </strong>
                  </div>
                  {b.trainer_name && (
                    <div className="flex items-center justify-between">
                      <span>Faculty Lead:</span>
                      <strong className="text-slate-900">{b.trainer_name}</strong>
                    </div>
                  )}
                  {b.start_date && (
                    <div className="flex items-center justify-between">
                      <span>Start Date:</span>
                      <span>{new Date(b.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {batches.length === 0 && !loading && (
              <div className="col-span-3 p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Campus Batches Configured</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the button above to initialize a structured semester training cohort for your campus.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Authorized Student Directory */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Authorized College Students</h3>
              <p className="text-xs text-slate-500">
                Verified student learners affiliated with {org?.name}
              </p>
            </div>

            <form onSubmit={handleStudentSearch} className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs bg-slate-50 focus:ring-1 focus:ring-teal-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Active Batches</th>
                  <th className="pb-3">Courses Completed</th>
                  <th className="pb-3">Certificates</th>
                  <th className="pb-3">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-900">{s.full_name}</td>
                    <td className="py-3 text-slate-600">{s.email}</td>
                    <td className="py-3">
                      {s.active_batch_names.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.active_batch_names.map((bName, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200"
                            >
                              {bName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {s.completed_courses_count} of {s.enrolled_courses_count}
                    </td>
                    <td className="py-3 font-semibold text-emerald-700">
                      {s.certificates_count > 0 ? `${s.certificates_count} Verified` : '0'}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(s.registered_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No student records match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NAAC / NBA Accreditation Reports */}
      {activeTab === 'reports' && report && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
                Institutional Quality & Compliance
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                NAAC & NBA Outcome-Based Education Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifiable metrics compiled from relational LMS audit logs and assessment attempts.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export Compliance CSV</span>
            </button>
          </div>

          {/* NAAC Criterion 1 & 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  NAAC Criterion 1: Curricular Aspects
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex justify-between">
                  <span>Value-Added Technical Tracks Enrolled:</span>
                  <strong className="text-slate-900">
                    {report.naac_nba_criterion_summary.criterion_1_curricular_aspects.value_added_courses_enrolled}
                  </strong>
                </li>
                <li className="flex justify-between">
                  <span>Student Completion & Certification Rate:</span>
                  <strong className="text-emerald-700">
                    {report.naac_nba_criterion_summary.criterion_1_curricular_aspects.percentage_of_students_completing}
                  </strong>
                </li>
                <li className="flex justify-between">
                  <span>Curriculum Alignment:</span>
                  <strong className="text-slate-900">
                    {report.naac_nba_criterion_summary.criterion_1_curricular_aspects.curriculum_enrichment_status}
                  </strong>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  NAAC Criterion 2: Teaching-Learning & Evaluation
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex justify-between">
                  <span>Experiential Capstone Learning:</span>
                  <strong className="text-slate-900">
                    {report.naac_nba_criterion_summary.criterion_2_teaching_learning_evaluation.experiential_project_learning}
                  </strong>
                </li>
                <li className="flex justify-between">
                  <span>Average Cohort Attendance Rate:</span>
                  <strong className="text-slate-900">
                    {report.naac_nba_criterion_summary.criterion_2_teaching_learning_evaluation.average_cohort_attendance_rate}
                  </strong>
                </li>
                <li className="flex justify-between">
                  <span>Assessment Pass Rate:</span>
                  <strong className="text-slate-900">
                    {report.naac_nba_criterion_summary.criterion_2_teaching_learning_evaluation.continuous_assessment_pass_rate}
                  </strong>
                </li>
              </ul>
            </div>
          </div>

          {/* Cohorts Breakdown Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Cohort-Level Assessment & Attendance Breakdown
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Batch Code</th>
                    <th className="pb-3">Batch Name</th>
                    <th className="pb-3">Track / Curriculum</th>
                    <th className="pb-3">Enrolled</th>
                    <th className="pb-3">Attendance Rate</th>
                    <th className="pb-3">Quiz Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.cohorts.map((c) => (
                    <tr key={c.batch_id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-teal-800">{c.batch_code}</td>
                      <td className="py-3 font-semibold text-slate-900">{c.batch_name}</td>
                      <td className="py-3 text-slate-600">{c.course_title}</td>
                      <td className="py-3 font-medium text-slate-800">{c.enrolled_count}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            c.attendance_rate >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.attendance_rate}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800">
                          {c.quiz_pass_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {report.cohorts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No batch data available for compliance compilation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Training Proposals */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Semester Training Proposals</h3>
            <button
              onClick={() => setShowProposalModal(true)}
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              + Submit New Proposal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        p.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'SCHEDULED'
                          ? 'bg-teal-100 text-teal-800'
                          : p.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                  <p className="text-xs text-slate-500">Target: {p.target_audience}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Estimated Students:</span>
                    <strong>{p.estimated_students}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Mode:</span>
                    <strong>{p.training_mode}</strong>
                  </div>
                  {p.preferred_start_date && (
                    <div className="flex justify-between">
                      <span>Preferred Start:</span>
                      <strong>{p.preferred_start_date}</strong>
                    </div>
                  )}
                  {p.notes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-[11px] text-slate-500 italic">
                      "{p.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}

            {proposals.length === 0 && !loading && (
              <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Proposals Submitted</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit customized curriculum proposals for your department or semester programs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {showEditOrgModal && org && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit College Details</h3>
              <button
                onClick={() => setShowEditOrgModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOrgProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Website
                </label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Address
                </label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditOrgModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrg}
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingOrg ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Campus Batch */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Create Campus Cohort Batch</h3>
              <button
                onClick={() => setShowCreateBatchModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Cohort Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026 CS Autonomous Systems Cohort"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unique Cohort Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RVCE-AUTO-2026"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Student Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={batchMaxStudents}
                    onChange={(e) => setBatchMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Curriculum
                </label>
                <select
                  value={batchCourseId}
                  onChange={(e) => setBatchCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
                >
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={batchStartDate}
                    onChange={(e) => setBatchStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={batchEndDate}
                    onChange={(e) => setBatchEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateBatchModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBatch}
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {creatingBatch ? 'Creating...' : 'Create Cohort Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Proposal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Request Semester Training Proposal</h3>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Proposal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6th Sem Full-Stack Web Bootcamp"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Curriculum Track
                </label>
                <select
                  value={proposalCourseId || ''}
                  onChange={(e) => setProposalCourseId(Number(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
                >
                  <option value="">Custom Department Program</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Department / Year
                  </label>
                  <input
                    type="text"
                    value={proposalAudience}
                    onChange={(e) => setProposalAudience(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Student Count
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={proposalStudents}
                    onChange={(e) => setProposalStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Start Date
                  </label>
                  <input
                    type="date"
                    value={proposalDate}
                    onChange={(e) => setProposalDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Training Mode
                  </label>
                  <select
                    value={proposalMode}
                    onChange={(e) => setProposalMode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
                  >
                    <option value="HYBRID">Hybrid (Campus Labs + LMS)</option>
                    <option value="ON_CAMPUS">100% In-Person Campus</option>
                    <option value="ONLINE">Interactive Remote Cohort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department Requirements & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention target outcomes, required faculty coordination, or internal grading schedules..."
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProposal}
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
