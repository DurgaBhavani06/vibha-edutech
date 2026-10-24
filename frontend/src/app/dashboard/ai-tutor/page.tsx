'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Code2,
  Bug,
  Lightbulb,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  BarChart3,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import {
  askAITutor,
  queryCourseRAG,
  fetchAIUsageStats,
} from '@/lib/ai';
import {
  TutorMode,
  DifficultyLevel,
  AITutorResponse,
  RAGQueryResponse,
  AIUsageStats,
} from '@/types/ai';

export default function AITutorPage() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'tutor' | 'rag' | 'usage'>('tutor');

  // AI Tutor States
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [tutorMode, setTutorMode] = useState<TutorMode>('HINT');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('BEGINNER');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorHistory, setTutorHistory] = useState<
    Array<{
      query: string;
      mode: TutorMode;
      difficulty: DifficultyLevel;
      response: AITutorResponse;
      timestamp: string;
    }>
  >([]);

  // RAG States
  const [ragCourseId, setRagCourseId] = useState<number>(1);
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);

  // Usage & Quota States
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    loadUsage();
  }, [token]);

  async function loadUsage() {
    setLoadingUsage(true);
    try {
      const stats = await fetchAIUsageStats(token || undefined);
      setUsageStats(stats);
    } catch {
      // Mock / fallback if offline
      setUsageStats({
        total_tokens: 1250,
        total_cost_usd: 0.0025,
        calls_count: 3,
        daily_quota_limit: 50000,
        daily_tokens_used: 1250,
        daily_quota_remaining: 48750,
        quota_reset_utc: new Date(Date.now() + 3600000 * 12).toISOString(),
      });
    } finally {
      setLoadingUsage(false);
    }
  }

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorPrompt.trim() || tutorLoading) return;

    setTutorLoading(true);
    setTutorError(null);

    const currentPrompt = tutorPrompt;
    try {
      const resp = await askAITutor(
        {
          prompt: currentPrompt,
          mode: tutorMode,
          difficulty: difficulty,
          course_id: ragCourseId,
        },
        token || undefined
      );

      setTutorHistory((prev) => [
        {
          query: currentPrompt,
          mode: tutorMode,
          difficulty: difficulty,
          response: resp,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setTutorPrompt('');
      loadUsage();
    } catch (err: any) {
      setTutorError(err.message || 'Failed to generate tutor response.');
    } finally {
      setTutorLoading(false);
    }
  };

  const handleRAGSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim() || ragLoading) return;

    setRagLoading(true);
    setRagError(null);
    try {
      const resp = await queryCourseRAG(
        {
          course_id: ragCourseId,
          query: ragQuery,
        },
        token || undefined
      );
      setRagResult(resp);
      loadUsage();
    } catch (err: any) {
      setRagError(err.message || 'Failed to search course documents.');
    } finally {
      setRagLoading(false);
    }
  };

  const setSamplePrompt = (text: string, mode: TutorMode) => {
    setTutorPrompt(text);
    setTutorMode(mode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-vibha-navy to-vibha-navy-light rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibha-teal/20 text-vibha-teal text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-vibha-teal" />
            VIBHA AI Intelligence Layer
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">AI Tutor & Document Assistant</h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Pedagogical guidance, grounded course references, and daily token-metered access.
          </p>
        </div>

        {/* Quota Gauge */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3.5 min-w-[240px] text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-vibha-grey">Daily Token Quota:</span>
            <span className="font-mono font-semibold text-vibha-teal">
              {usageStats
                ? `${usageStats.daily_tokens_used.toLocaleString()} / ${usageStats.daily_quota_limit.toLocaleString()}`
                : 'Loading...'}
            </span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-vibha-teal h-full transition-all duration-500"
              style={{
                width: usageStats
                  ? `${Math.min(100, (usageStats.daily_tokens_used / usageStats.daily_quota_limit) * 100)}%`
                  : '0%',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-vibha-grey/70">
            <span>Quota resets at 00:00 UTC</span>
            <span className="font-semibold text-emerald-400">
              {usageStats ? `${usageStats.daily_quota_remaining.toLocaleString()} left` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-vibha-slate-border">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'tutor'
              ? 'border-vibha-teal text-vibha-teal'
              : 'border-transparent text-vibha-slate-light hover:text-vibha-navy'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Interactive AI Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'rag'
              ? 'border-vibha-teal text-vibha-teal'
              : 'border-transparent text-vibha-slate-light hover:text-vibha-navy'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Document Assistant (RAG)</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'usage'
              ? 'border-vibha-teal text-vibha-teal'
              : 'border-transparent text-vibha-slate-light hover:text-vibha-navy'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Usage Quotas & Auditing</span>
        </button>
      </div>

      {/* TAB 1: AI TUTOR */}
      {activeTab === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Prompt composer & conversation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Box */}
            <div className="bg-white rounded-2xl border border-vibha-slate-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-vibha-navy flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vibha-teal" />
                  Ask VIBHA AI Tutor
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-vibha-slate-light">Level:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="text-xs bg-vibha-grey/50 border border-vibha-slate-border rounded-lg px-2.5 py-1 text-vibha-navy focus:outline-none focus:border-vibha-teal"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTutorMode('HINT')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tutorMode === 'HINT'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-sm'
                      : 'border-vibha-slate-border/70 hover:bg-slate-50 text-vibha-slate'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Pedagogical Hint</span>
                  </div>
                  <div className="text-[10px] text-vibha-slate-light mt-0.5">
                    Guides without giving away answers
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorMode('EXPLAIN')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tutorMode === 'EXPLAIN'
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-sm'
                      : 'border-vibha-slate-border/70 hover:bg-slate-50 text-vibha-slate'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Concept Deep-Dive</span>
                  </div>
                  <div className="text-[10px] text-vibha-slate-light mt-0.5">
                    Clear theoretical & practical breakdown
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorMode('CODE_EXAMPLE')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tutorMode === 'CODE_EXAMPLE'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-sm'
                      : 'border-vibha-slate-border/70 hover:bg-slate-50 text-vibha-slate'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code Snippet</span>
                  </div>
                  <div className="text-[10px] text-vibha-slate-light mt-0.5">
                    Clean, idiomatic architecture pattern
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTutorMode('DEBUG')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    tutorMode === 'DEBUG'
                      ? 'bg-purple-50/70 border-purple-300 text-purple-900 shadow-sm'
                      : 'border-vibha-slate-border/70 hover:bg-slate-50 text-vibha-slate'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700">
                    <Bug className="w-3.5 h-3.5" />
                    <span>Debug Checklist</span>
                  </div>
                  <div className="text-[10px] text-vibha-slate-light mt-0.5">
                    Troubleshoot edge cases & logs
                  </div>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleTutorSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  value={tutorPrompt}
                  onChange={(e) => setTutorPrompt(e.target.value)}
                  placeholder={
                    tutorMode === 'HINT'
                      ? 'e.g., I am getting a 401 Unauthorized on my FastAPI protected endpoint. Where should I check first?'
                      : tutorMode === 'DEBUG'
                      ? 'e.g., My Alembic migration says table already exists. How do I fix it safely?'
                      : 'e.g., How does async/await concurrency work under the hood in Python 3.12?'
                  }
                  className="w-full text-xs rounded-xl border border-vibha-slate-border p-3 focus:outline-none focus:border-vibha-teal font-sans text-vibha-navy"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-vibha-slate-light flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-vibha-teal" />
                    <span>Sanitized & prompt-injection protected</span>
                  </div>

                  <button
                    type="submit"
                    disabled={tutorLoading || !tutorPrompt.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-vibha-teal hover:bg-vibha-teal-dark disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {tutorLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Response...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Consult Tutor</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {tutorError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{tutorError}</span>
                </div>
              )}
            </div>

            {/* Conversation Stream */}
            <div className="space-y-4">
              {tutorHistory.length === 0 ? (
                <div className="bg-white rounded-2xl border border-vibha-slate-border p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-vibha-teal/10 text-vibha-teal flex items-center justify-center mx-auto">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-vibha-navy">Ready for your technical questions</h3>
                  <p className="text-xs text-vibha-slate-light max-w-md mx-auto">
                    Choose a mode above and ask any programming, architecture, or course question. The tutor is calibrated to guide your learning without cutting corners.
                  </p>
                </div>
              ) : (
                tutorHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-vibha-slate-border overflow-hidden shadow-sm"
                  >
                    {/* User Prompt Header */}
                    <div className="bg-slate-50/70 p-4 border-b border-vibha-slate-border flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-vibha-navy text-white">
                            {item.mode}
                          </span>
                          <span className="text-[10px] font-medium text-vibha-slate-light">
                            Level: {item.difficulty}
                          </span>
                          <span className="text-[10px] text-vibha-slate-light">• {item.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-vibha-navy">{item.query}</p>
                      </div>
                    </div>

                    {/* AI Output */}
                    <div className="p-5 space-y-4">
                      <div className="prose prose-sm max-w-none text-xs text-vibha-slate leading-relaxed whitespace-pre-wrap font-sans">
                        {item.response.response}
                      </div>

                      {/* Footer Metadata */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-vibha-slate-light">
                        <span className="flex items-center gap-1 font-mono">
                          <Cpu className="w-3 h-3 text-vibha-teal" />
                          Model: {item.response.model_name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>Tokens: {item.response.tokens_used}</span>
                          <span>Est. Cost: ${item.response.estimated_cost_usd.toFixed(5)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Col: Quick Prompts & Pedagogical Guidelines */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-vibha-slate-border p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-vibha-navy uppercase tracking-wider">
                Recommended Prompt Templates
              </h3>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setSamplePrompt(
                      'I am getting a 401 Unauthorized when sending requests with an Authorization header in FastAPI. What troubleshooting steps should I follow?',
                      'HINT'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-vibha-slate-border/80 hover:border-vibha-teal/80 hover:bg-vibha-grey/30 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>FastAPI 401 Troubleshooting</span>
                  </div>
                  <p className="text-[11px] text-vibha-slate-light line-clamp-2">
                    Step-by-step guidance on bearer tokens, scheme matching, and headers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSamplePrompt(
                      'Explain the differences between PostgreSQL B-tree, Hash, and GIN indexes with real-world query use cases.',
                      'EXPLAIN'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-vibha-slate-border/80 hover:border-vibha-teal/80 hover:bg-vibha-grey/30 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>PostgreSQL Index Selection</span>
                  </div>
                  <p className="text-[11px] text-vibha-slate-light line-clamp-2">
                    Detailed analysis of index algorithms and write-amplification trade-offs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSamplePrompt(
                      'Show an idiomatic SQLAlchemy 2.0 async session context manager pattern with rollback safety.',
                      'CODE_EXAMPLE'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-vibha-slate-border/80 hover:border-vibha-teal/80 hover:bg-vibha-grey/30 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>SQLAlchemy Async Session Pattern</span>
                  </div>
                  <p className="text-[11px] text-vibha-slate-light line-clamp-2">
                    Clean boilerplate with commit/rollback transaction safety.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSamplePrompt(
                      'My Alembic migration fails with "Target database is not up to date". How do I safely reconcile heads?',
                      'DEBUG'
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-vibha-slate-border/80 hover:border-vibha-teal/80 hover:bg-vibha-grey/30 transition-all text-xs space-y-1"
                >
                  <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Alembic Migration Reconcile</span>
                  </div>
                  <p className="text-[11px] text-vibha-slate-light line-clamp-2">
                    Resolving divergent migration heads without data loss.
                  </p>
                </button>
              </div>
            </div>

            {/* Pedagogical Integrity Note */}
            <div className="p-4 rounded-xl bg-vibha-grey/50 border border-vibha-slate-border/60 text-xs text-vibha-slate space-y-2">
              <div className="font-bold text-vibha-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-vibha-teal" />
                <span>Pedagogical Integrity Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-vibha-slate-light">
                VIBHA AI Tutor is engineered with strict guardrails. It promotes active problem-solving rather than rote code copying, ensuring you develop real industry engineering instincts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE DOCUMENT ASSISTANT (RAG) */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-vibha-slate-border p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-vibha-navy flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-vibha-teal" />
                Query Approved Course Manuals & Reference Guides
              </h2>
              <p className="text-xs text-vibha-slate-light mt-1">
                Answers are synthesized strictly from approved course documentation with exact chunk citations.
              </p>
            </div>

            <form onSubmit={handleRAGSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-vibha-slate-light uppercase mb-1">
                    Select Course
                  </label>
                  <select
                    value={ragCourseId}
                    onChange={(e) => setRagCourseId(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-vibha-slate-border p-2.5 focus:outline-none focus:border-vibha-teal text-vibha-navy"
                  >
                    <option value={1}>Course 1: Full-Stack Web Development</option>
                    <option value={2}>Course 2: Cloud Native DevOps</option>
                    <option value={3}>Course 3: Applied AI & Machine Learning</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-vibha-slate-light uppercase mb-1">
                    Course Document Query
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="e.g., What are the token limits and circuit breaker patterns in the course architecture?"
                      className="flex-1 text-xs rounded-xl border border-vibha-slate-border px-3 py-2.5 focus:outline-none focus:border-vibha-teal text-vibha-navy"
                    />
                    <button
                      type="submit"
                      disabled={ragLoading || !ragQuery.trim()}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-vibha-teal hover:bg-vibha-teal-dark disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                    >
                      {ragLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Search Materials</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {ragError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{ragError}</span>
              </div>
            )}
          </div>

          {/* RAG Results Area */}
          {ragResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Synthesized Answer */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-vibha-slate-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vibha-slate-border/60">
                  <h3 className="text-sm font-bold text-vibha-navy">Synthesized Course Reference</h3>
                  {ragResult.is_grounded ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Grounded in Course Material
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Not Covered in Approved Docs
                    </span>
                  )}
                </div>

                <div className="prose prose-sm max-w-none text-xs text-vibha-slate leading-relaxed whitespace-pre-wrap font-sans">
                  {ragResult.answer}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-vibha-slate-light">
                  <span className="font-mono">Engine: {ragResult.model_name}</span>
                  <span>Tokens used: {ragResult.tokens_used}</span>
                </div>
              </div>

              {/* Citations & Evidence Passages */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-vibha-slate-border p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-vibha-navy uppercase tracking-wider">
                      Source Citations ({ragResult.citations.length})
                    </h3>
                  </div>

                  {ragResult.citations.length === 0 ? (
                    <div className="text-xs text-vibha-slate-light italic p-4 text-center">
                      No matching passages found in approved course reference documents.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ragResult.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-vibha-slate-border/80 bg-slate-50/50 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-vibha-navy text-[11px]">
                                {c.document_title}
                              </div>
                              <div className="text-[10px] text-vibha-slate-light font-mono">
                                {c.source_filename} • Chunk #{c.chunk_index}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-vibha-teal/10 text-vibha-teal font-mono text-[10px] font-semibold shrink-0">
                              {Math.round(c.relevance_score * 100)}% match
                            </span>
                          </div>

                          <blockquote className="text-[11px] text-vibha-slate italic pl-2.5 border-l-2 border-vibha-teal">
                            &quot;{c.excerpt}&quot;
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USAGE & AUDIT */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
              <div className="text-xs font-semibold text-vibha-slate-light uppercase">Daily Quota Allocated</div>
              <div className="text-2xl font-bold text-vibha-navy">
                {usageStats?.daily_quota_limit.toLocaleString()} Tokens
              </div>
              <div className="text-[11px] text-vibha-teal font-medium">Per-student daily allowance</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
              <div className="text-xs font-semibold text-vibha-slate-light uppercase">Daily Consumed</div>
              <div className="text-2xl font-bold text-vibha-navy">
                {usageStats?.daily_tokens_used.toLocaleString()} Tokens
              </div>
              <div className="text-[11px] text-vibha-slate-light">
                {usageStats
                  ? `${((usageStats.daily_tokens_used / usageStats.daily_quota_limit) * 100).toFixed(1)}% of daily allowance`
                  : ''}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
              <div className="text-xs font-semibold text-vibha-slate-light uppercase">Lifetime AI Calls</div>
              <div className="text-2xl font-bold text-vibha-navy">{usageStats?.calls_count} Invocations</div>
              <div className="text-[11px] text-emerald-600 font-medium">
                Est. Cost: ${usageStats?.total_cost_usd.toFixed(4)} USD
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-vibha-slate-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-vibha-navy">AI Governance & Operational Guardrails</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-vibha-slate">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-vibha-teal" />
                  <span>Cost Control & Rate Limiting</span>
                </div>
                <p className="text-[11px] text-vibha-slate-light leading-relaxed">
                  Strict daily quotas (50,000 tokens/day) prevent unexpected spend. HTTP 429 status codes protect downstream providers against brute force or scraping.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <div className="font-semibold text-vibha-navy flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-vibha-teal" />
                  <span>Provider-Independent Abstraction</span>
                </div>
                <p className="text-[11px] text-vibha-slate-light leading-relaxed">
                  The LMS runs seamlessly with OpenAI, Google Gemini, or local Mock providers. If external AI APIs experience latency or downtime, core educational services remain unaffected.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
