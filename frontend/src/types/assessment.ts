export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AssessmentType = 'QUIZ' | 'EXAM' | 'ASSIGNMENT';
export type SubmissionStatus = 'PENDING' | 'UNDER_REVIEW' | 'GRADED' | 'REJECTED';

export interface BatchStudentRosterItem {
  student_id: number;
  full_name: string;
  email: string;
  enrolled_at: string;
}

export interface Batch {
  id: number;
  name: string;
  code: string;
  course_id: number;
  course_title?: string;
  trainer_id?: number;
  trainer_name?: string;
  organization_id?: number;
  organization_name?: string;
  max_students: number;
  is_active: boolean;
  student_count: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface BatchDetail extends Batch {
  students: BatchStudentRosterItem[];
}

export interface AttendanceRecordInput {
  student_id: number;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceResponse {
  id: number;
  batch_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  session_date: string;
  status: AttendanceStatus;
  remarks?: string;
  marked_by?: number;
  created_at: string;
}

export interface StudentAttendanceStat {
  student_id: number;
  full_name: string;
  email: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_percentage: number;
}

export interface BatchAttendanceSummary {
  batch_id: number;
  batch_name: string;
  total_dates_recorded: number;
  student_stats: StudentAttendanceStat[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionStudent {
  id: number;
  assessment_id: number;
  question_text: string;
  question_type: string;
  options: QuestionOption[];
  points: number;
  order_index: number;
}

export interface AssessmentStudent {
  id: number;
  course_id: number;
  module_id?: number;
  lesson_id?: number;
  title: string;
  description?: string;
  assessment_type: AssessmentType;
  passing_score: number;
  time_limit_minutes: number;
  is_published: boolean;
  question_count: number;
  questions: QuestionStudent[];
}

export interface DetailedResult {
  question_id: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points_awarded: number;
  points_possible: number;
  explanation?: string;
}

export interface AssessmentAttemptResponse {
  id: number;
  assessment_id: number;
  assessment_title?: string;
  user_id: number;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  is_completed: boolean;
  started_at: string;
  submitted_at?: string;
  detailed_results?: DetailedResult[];
}

export interface Submission {
  id: number;
  course_id: number;
  course_title?: string;
  lesson_id?: number;
  lesson_title?: string;
  student_id: number;
  student_name?: string;
  student_email?: string;
  title: string;
  github_url?: string;
  submission_url?: string;
  notes?: string;
  status: SubmissionStatus;
  grade?: number;
  trainer_feedback?: string;
  graded_by?: number;
  graded_by_name?: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  certificate_code: string;
  user_id: number;
  student_name?: string;
  course_id: number;
  course_title?: string;
  issued_at: string;
  is_revoked: boolean;
  revocation_reason?: string;
  revoked_at?: string;
  grade_percentage?: number;
  verification_url: string;
}

export interface CertificateVerification {
  valid: boolean;
  certificate_code: string;
  student_name?: string;
  course_title?: string;
  issued_at?: string;
  is_revoked: boolean;
  revocation_reason?: string;
  grade_percentage?: number;
  message: string;
}
