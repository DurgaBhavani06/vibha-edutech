import { CourseSummary } from '@/types';

export interface LessonSummary {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  lesson_type: 'VIDEO' | 'TEXT' | 'LAB' | 'RESOURCE' | 'QUIZ' | 'ASSIGNMENT';
  duration_min: number;
  order_index: number;
  is_preview: boolean;
  is_completed?: boolean;
}

export interface LessonDetail {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  lesson_type: 'VIDEO' | 'TEXT' | 'LAB' | 'RESOURCE' | 'QUIZ' | 'ASSIGNMENT';
  duration_min: number;
  content?: string | null;
  video_url?: string | null;
  resource_url?: string | null;
  order_index: number;
  is_preview: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleResponse {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  order_index: number;
  lessons: LessonSummary[];
}

export interface EnrollmentResponse {
  id: number;
  user_id: number;
  course_id: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'DROPPED';
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string | null;
  course?: CourseSummary | null;
}

export interface CourseProgressSummary {
  course_id: number;
  enrollment_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  completed_lesson_ids: number[];
}
