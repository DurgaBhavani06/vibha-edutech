import React from 'react';
import Link from 'next/link';
import { CourseSummary } from '@/types';
import { Clock, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CourseCardProps {
  course: CourseSummary;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-vibha-slate-border shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden group">
      {/* Top Banner with Badges */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-vibha-teal-subtle text-vibha-teal-dark">
            {course.category}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-vibha-grey text-vibha-slate">
            {course.level}
          </span>
        </div>

        <h3 className="text-lg font-bold text-vibha-navy group-hover:text-vibha-teal transition-colors line-clamp-2 mb-2">
          {course.title}
        </h3>

        <p className="text-sm text-vibha-slate-light line-clamp-3 mb-4 leading-relaxed">
          {course.tagline}
        </p>

        {/* Key skills pills */}
        <div className="space-y-1 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-vibha-slate mb-1.5">
            Key Competencies:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {course.key_skills.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-xs bg-vibha-grey text-vibha-slate px-2 py-0.5 rounded font-medium"
              >
                {skill}
              </span>
            ))}
            {course.key_skills.length > 4 && (
              <span className="text-xs text-vibha-slate-light px-1.5 py-0.5 font-medium">
                +{course.key_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="px-6 py-4 bg-vibha-grey/50 border-t border-vibha-slate-border/60">
        <div className="flex items-center justify-between text-xs text-vibha-slate mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-vibha-teal" />
            <span>{course.duration_weeks} Weeks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-vibha-teal" />
            <span>{course.hours_per_week} hrs/wk</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${course.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-vibha-navy text-white hover:bg-vibha-teal transition-colors shadow-sm"
          >
            <span>View Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/contact?course=${course.slug}&type=STUDENT`}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-vibha-slate-border text-vibha-slate hover:bg-white hover:text-vibha-navy transition-colors"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}
