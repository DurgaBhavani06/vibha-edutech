'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchLesson,
  toggleLessonComplete,
  fetchCourseModules,
  fetchCourseProgress,
} from '@/lib/lms';
import { fetchCourseBySlug } from '@/lib/api';
import { LessonDetail, ModuleResponse, CourseProgressSummary } from '@/types/lms';
import { CourseDetail } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  FileText,
  Clock,
  Layers,
  Loader2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Video,
} from 'lucide-react';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const slug = params?.slug as string;
  const lessonIdNum = Number(params?.lessonId);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [progress, setProgress] = useState<CourseProgressSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load course, lesson, modules, and progress
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        // Fetch course
        const c = await fetchCourseBySlug(slug);
        if (!c) {
          setErrorMsg('Course not found.');
          setIsLoading(false);
          return;
        }
        setCourse(c);

        // Fetch lesson details
        const l = await fetchLesson(lessonIdNum, token || undefined);
        setLesson(l);

        // Fetch modules
        const mods = await fetchCourseModules(c.id);
        setModules(mods);

        // Fetch progress
        const prog = await fetchCourseProgress(c.id, token || undefined);
        setProgress(prog);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error loading lesson.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && lessonIdNum) {
      loadAll();
    }
  }, [slug, lessonIdNum, token]);

  const handleToggleComplete = async () => {
    if (!lesson || isToggling) return;
    setIsToggling(true);

    try {
      const res = await toggleLessonComplete(lesson.id, token || undefined);
      setLesson({
        ...lesson,
        is_completed: res.is_completed,
      });

      // Update progress summary
      if (course) {
        const updatedProg = await fetchCourseProgress(course.id, token || undefined);
        setProgress(updatedProg);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update lesson status.');
    } finally {
      setIsToggling(false);
    }
  };

  // Find next and previous lessons
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonIdNum);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-vibha-teal" />
        <span className="text-xs text-vibha-slate-light font-medium">
          Loading learning module & secure player...
        </span>
      </div>
    );
  }

  if (errorMsg || !lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-vibha-navy">Access Restricted</h2>
        <p className="text-sm text-vibha-slate leading-relaxed">{errorMsg}</p>
        <Link
          href={`/courses/${slug}`}
          className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-vibha-navy text-white hover:bg-vibha-teal transition-colors"
        >
          View Course & Enroll
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vibha-grey/30 flex flex-col">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-vibha-slate-border px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/dashboard"
            className="text-vibha-slate-light hover:text-vibha-navy font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span className="text-vibha-slate-border">/</span>
          <Link
            href={`/courses/${slug}`}
            className="text-vibha-slate font-medium hover:text-vibha-teal truncate max-w-[200px]"
          >
            {course?.title}
          </Link>
          <span className="text-vibha-slate-border">/</span>
          <span className="text-vibha-navy font-bold truncate max-w-[240px]">
            {lesson.title}
          </span>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          {progress && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-vibha-slate-light">Progress:</span>
              <span className="font-bold text-vibha-navy">
                {progress.progress_percentage}%
              </span>
              <div className="w-20 bg-vibha-grey rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-vibha-teal h-1.5 rounded-full"
                  style={{ width: `${progress.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-vibha-slate-border text-xs text-vibha-slate hover:bg-vibha-grey"
          >
            {sidebarOpen ? 'Hide Curriculum' : 'Show Curriculum'}
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Content + Right Curriculum Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Lesson View Area */}
        <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Video Player (if lesson has video_url) */}
          {lesson.video_url && (
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-900 aspect-video relative flex items-center justify-center">
              <video
                src={lesson.video_url}
                controls
                className="w-full h-full object-contain"
                poster="/video-poster.png"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Lesson Header */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-vibha-slate-border shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vibha-slate-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-vibha-teal">
                  <span className="uppercase px-2 py-0.5 rounded bg-vibha-teal-subtle text-vibha-teal-dark font-mono text-[10px]">
                    {lesson.lesson_type}
                  </span>
                  <span>• {lesson.duration_min} Minutes</span>
                  {lesson.is_preview && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                      Free Preview
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-vibha-navy">
                  {lesson.title}
                </h1>
              </div>

              {/* Completion Action Button */}
              <button
                onClick={handleToggleComplete}
                disabled={isToggling}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow-sm ${
                  lesson.is_completed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-vibha-navy text-white hover:bg-vibha-teal'
                }`}
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      lesson.is_completed ? 'text-emerald-600' : 'text-white'
                    }`}
                  />
                )}
                <span>
                  {lesson.is_completed
                    ? 'Completed ✓'
                    : 'Mark as Complete'}
                </span>
              </button>
            </div>

            {/* Markdown / Lesson Body */}
            <div className="prose prose-sm max-w-none text-vibha-slate leading-relaxed space-y-4">
              {lesson.content ? (
                <div className="whitespace-pre-wrap font-sans text-sm">
                  {lesson.content}
                </div>
              ) : (
                <p className="text-xs text-vibha-slate-light italic">
                  Follow the interactive live lecture and lab instructions presented above.
                </p>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-vibha-slate-border flex items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/dashboard/courses/${slug}/lessons/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-vibha-slate bg-vibha-grey hover:bg-vibha-slate-border transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous: {prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Link
                  href={`/dashboard/courses/${slug}/lessons/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-vibha-teal hover:bg-vibha-teal-dark transition-colors shadow-sm ml-auto"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-80 bg-white border-l border-vibha-slate-border p-5 space-y-5 shrink-0 overflow-y-auto max-h-[calc(100vh-60px)]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-vibha-teal">
                Course Syllabus
              </span>
              <h3 className="text-sm font-bold text-vibha-navy truncate">
                {course?.title}
              </h3>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {modules.map((mod) => (
                <div key={mod.id} className="space-y-2">
                  <div className="text-xs font-bold text-vibha-navy flex items-center justify-between pb-1 border-b border-vibha-slate-border/50">
                    <span>
                      Mod {mod.order_index}: {mod.title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {mod.lessons.map((les) => {
                      const isActive = les.id === lessonIdNum;
                      const isDone =
                        progress?.completed_lesson_ids.includes(les.id) ||
                        (isActive && lesson.is_completed);

                      return (
                        <Link
                          key={les.id}
                          href={`/dashboard/courses/${slug}/lessons/${les.id}`}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'bg-vibha-navy text-white font-semibold'
                              : 'text-vibha-slate hover:bg-vibha-grey'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-emerald-400' : 'text-emerald-600'
                                }`}
                              />
                            ) : (
                              <PlayCircle
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-vibha-teal' : 'text-vibha-slate-light'
                                }`}
                              />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>
                          <span className="text-[10px] opacity-70 shrink-0 ml-1">
                            {les.duration_min}m
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
