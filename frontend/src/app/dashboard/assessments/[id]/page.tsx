'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAssessment,
  submitAssessmentAttempt,
  fetchMyAssessmentAttempts,
} from '@/lib/assessment';
import {
  AssessmentStudent,
  AssessmentAttemptResponse,
} from '@/types/assessment';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Award,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const assessmentId = Number(params?.id);

  const [assessment, setAssessment] = useState<AssessmentStudent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastAttempts, setPastAttempts] = useState<AssessmentAttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/dashboard/assessments/${assessmentId}`);
      return;
    }

    if (assessmentId) {
      loadData();
    }
  }, [assessmentId, user, isLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [assData, attempts] = await Promise.all([
        fetchAssessment(assessmentId),
        fetchMyAssessmentAttempts(assessmentId),
      ]);
      setAssessment(assData);
      setPastAttempts(attempts);
    } catch {
      setError('Unable to load assessment.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectOption(questionId: number, optionId: string) {
    if (result) return; // Prevent changing after submission
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionId,
    }));
  }

  async function handleSubmit() {
    if (!assessment) return;
    setError(null);

    // Check if at least 1 question is answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) {
      setError('Please select an answer before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const attemptRes = await submitAssessmentAttempt(assessment.id, answers);
      setResult(attemptRes);
      // Refresh past attempts list
      const updated = await fetchMyAssessmentAttempts(assessment.id);
      setPastAttempts(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Assessment Not Found</h2>
          <p className="text-slate-600 mb-6">The requested test or quiz could not be located or is not yet published.</p>
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Student Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-700 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {assessment.time_limit_minutes} Min Limit
          </div>
        </div>

        {/* Assessment Card Header */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
                {assessment.assessment_type}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{assessment.title}</h1>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-500 block">Passing Criteria</span>
              <span className="text-lg font-bold text-slate-900">{assessment.passing_score}%</span>
            </div>
          </div>
          {assessment.description && (
            <p className="text-slate-600 text-sm mt-1">{assessment.description}</p>
          )}
        </div>

        {/* Submission Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Evaluation Banner (Shown after submission) */}
        {result && (
          <div
            className={`mb-6 p-6 rounded-xl border ${
              result.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-4">
              {result.passed ? (
                <Award className="w-12 h-12 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-12 h-12 text-rose-600 shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {result.passed ? 'Assessment Passed! 🎉' : 'Assessment Not Passed'}
                  </h3>
                  <span className="text-2xl font-extrabold">{result.percentage}%</span>
                </div>
                <p className="text-sm mt-1">
                  You scored {result.score} out of {result.total_points} possible points. Required:{' '}
                  {assessment.passing_score}%.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-end gap-3">
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </button>
              <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                Continue Course
              </Link>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6 mb-8">
          {assessment.questions.map((q, idx) => {
            const questionKey = String(q.id);
            const selectedOption = answers[questionKey];
            const evalResult = result?.detailed_results?.find(
              (r) => r.question_id === q.id
            );

            return (
              <div
                key={q.id}
                className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${
                  evalResult
                    ? evalResult.is_correct
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{q.question_text}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
                    {q.points} Pts
                  </span>
                </div>

                {/* Options List */}
                <div className="space-y-2.5 ml-9">
                  {q.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isEvalAnswer = evalResult && evalResult.correct_answer === opt.id;
                    const isWrongAnswer = evalResult && !evalResult.is_correct && isSelected;

                    let optionClasses =
                      'p-3.5 rounded-lg border text-sm flex items-center justify-between cursor-pointer transition-all ';

                    if (evalResult) {
                      if (isEvalAnswer) {
                        optionClasses += 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                      } else if (isWrongAnswer) {
                        optionClasses += 'border-rose-500 bg-rose-50 text-rose-900 font-semibold';
                      } else {
                        optionClasses += 'border-slate-200 text-slate-500 opacity-60';
                      }
                    } else {
                      if (isSelected) {
                        optionClasses += 'border-teal-600 bg-teal-50 text-teal-900 font-medium shadow-sm';
                      } else {
                        optionClasses += 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300';
                      }
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={optionClasses}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded border flex items-center justify-center text-xs font-bold bg-white">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {evalResult && isEvalAnswer && (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {evalResult && isWrongAnswer && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Question Explanation (Revealed only after submission) */}
                {evalResult && evalResult.explanation && (
                  <div className="mt-4 ml-9 p-3.5 bg-slate-100/80 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Mentor Explanation:</strong>
                    {evalResult.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Actions */}
        {!result && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Answered {Object.keys(answers).length} of {assessment.questions.length} questions
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Evaluating...' : 'Submit Assessment'}
            </button>
          </div>
        )}

        {/* Past Attempts History */}
        {pastAttempts.length > 0 && (
          <div className="mt-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Your Attempt History
            </h4>
            <div className="divide-y divide-slate-100">
              {pastAttempts.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-900">
                      Score: {att.score}/{att.total_points} ({att.percentage}%)
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(att.started_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      att.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.passed ? 'PASSED' : 'NOT PASSED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
