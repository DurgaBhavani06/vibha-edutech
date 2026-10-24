'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { enrollInCourse } from '@/lib/lms';
import { PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface EnrollButtonProps {
  courseId: number;
  courseSlug: string;
  className?: string;
}

export default function EnrollButton({
  courseId,
  courseSlug,
  className = '',
}: EnrollButtonProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await enrollInCourse(courseId, token || undefined);
      router.push(`/dashboard/courses/${courseSlug}/lessons/1`);
    } catch (err: any) {
      // If already enrolled, navigate straight to player
      router.push(`/dashboard/courses/${courseSlug}/lessons/1`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isSubmitting}
      className={`px-5 py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Enrolling...</span>
        </>
      ) : (
        <>
          <PlayCircle className="w-4 h-4" />
          <span>{user ? 'Enroll & Start Learning' : 'Sign In to Enroll'}</span>
        </>
      )}
    </button>
  );
}
