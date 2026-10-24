import React from 'react';
import { fetchCourses } from '@/lib/api';
import CourseCard from '@/components/CourseCard';
import Link from 'next/link';
import { Search, Filter, Info, BookOpen } from 'lucide-react';

interface CoursesPageProps {
  searchParams?: {
    audience?: string;
    search?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const currentAudience = searchParams?.audience || 'all';
  const searchQuery = searchParams?.search || '';

  const data = await fetchCourses({
    audience: currentAudience,
    search: searchQuery,
  });

  const audienceFilters = [
    { label: 'All Courses', value: 'all' },
    { label: 'College Students', value: 'students' },
    { label: 'Fresh Graduates', value: 'freshers' },
    { label: 'Working Professionals', value: 'working-professionals' },
    { label: 'Partner Colleges', value: 'colleges' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal-subtle text-vibha-teal-dark text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-vibha-navy">
          Engineering & Technical Course Catalog
        </h1>
        <p className="text-sm text-vibha-slate max-w-2xl leading-relaxed">
          Explore our production-grade training tracks. Each curriculum combines fundamental software principles, hands-on lab exercises, and multi-component capstone projects.
        </p>
      </div>

      {/* Labeled Sample Notice Banner as mandated by specifications */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-blue-950">
            Curriculum Transparency Notice
          </div>
          <p className="text-blue-800 leading-relaxed">
            The course offerings displayed below are verified sample curricula designed by VIBHA to illustrate course syllabi, module breakdowns, learning outcomes, and technical project expectations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-vibha-slate-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Audience Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {audienceFilters.map((tab) => {
            const isActive = currentAudience === tab.value;
            return (
              <Link
                key={tab.value}
                href={`/courses?audience=${tab.value}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-vibha-navy text-white shadow-sm'
                    : 'bg-vibha-grey text-vibha-slate hover:bg-vibha-slate-border/50'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/courses" className="relative w-full md:w-72">
          {currentAudience !== 'all' && (
            <input type="hidden" name="audience" value={currentAudience} />
          )}
          <Search className="w-4 h-4 text-vibha-slate-light absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search skills, tech, topic..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-vibha-slate-border focus:border-vibha-teal focus:ring-1 focus:ring-vibha-teal bg-vibha-grey/30"
          />
        </form>
      </div>

      {/* Courses Grid or Empty State */}
      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-vibha-slate-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-vibha-grey text-vibha-slate-light flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-vibha-navy">No Courses Found</h3>
          <p className="text-sm text-vibha-slate max-w-sm mx-auto">
            No curricula matched your selected filter or search keyword.
          </p>
          <Link
            href="/courses"
            className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-vibha-navy text-white hover:bg-vibha-teal transition-colors"
          >
            Clear All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
