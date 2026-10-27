import {
  EnrollmentResponse,
  LessonDetail,
  ModuleResponse,
  CourseProgressSummary,
} from '@/types/lms';
import { getStoredToken } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://vibha-edutech.onrender.com/api/v1';

export async function fetchMyEnrollments(token?: string): Promise<EnrollmentResponse[]> {
  const activeToken = token || getStoredToken();
  if (!activeToken) return [];

  const res = await fetch(`${API_BASE_URL}/enrollments/my`, {
    headers: { Authorization: `Bearer ${activeToken}` },
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function enrollInCourse(
  courseId: number,
  token?: string
): Promise<EnrollmentResponse> {
  const activeToken = token || getStoredToken();
  if (!activeToken) {
    throw new Error('Please sign in to enroll in this course.');
  }

  const res = await fetch(`${API_BASE_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({ course_id: courseId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Enrollment failed.');
  }
  return data;
}

export async function fetchCourseModules(
  courseId: number
): Promise<ModuleResponse[]> {
  const res = await fetch(`${API_BASE_URL}/courses/${courseId}/modules`);
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchCourseProgress(
  courseId: number,
  token?: string
): Promise<CourseProgressSummary | null> {
  const activeToken = token || getStoredToken();
  if (!activeToken) return null;

  const res = await fetch(`${API_BASE_URL}/enrollments/${courseId}/progress`, {
    headers: { Authorization: `Bearer ${activeToken}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchLesson(
  lessonId: number,
  token?: string
): Promise<LessonDetail> {
  const activeToken = token || getStoredToken();
  const headers: HeadersInit = {};
  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to load lesson content.');
  }
  return data;
}

export async function toggleLessonComplete(
  lessonId: number,
  token?: string
): Promise<{
  lesson_id: number;
  is_completed: boolean;
  course_progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
}> {
  const activeToken = token || getStoredToken();
  if (!activeToken) {
    throw new Error('Authentication required.');
  }

  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${activeToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update lesson completion status.');
  }
  return data;
}
