export type EnquiryType =
  | 'STUDENT'
  | 'COLLEGE_TRAINING'
  | 'CORPORATE_TRAINING'
  | 'GENERAL_CONTACT';

export interface EnquiryFormData {
  full_name: string;
  email: string;
  phone: string;
  enquiry_type: EnquiryType;
  organization_or_college?: string;
  course_slug?: string;
  message: string;
  hp_token?: string;
}

export interface EnquirySubmitResponse {
  success: boolean;
  reference_code: string;
  message: string;
  enquiry?: {
    id: number;
    reference_code: string;
    full_name: string;
    email: string;
    phone: string;
    enquiry_type: EnquiryType;
    organization_or_college?: string;
    course_slug?: string;
    message: string;
    status: string;
    created_at: string;
  };
}

export interface ModuleLesson {
  title: string;
  type: string;
  duration_min: number;
}

export interface CourseModule {
  module_number: number;
  title: string;
  description: string;
  lessons: ModuleLesson[];
}

export interface CourseProject {
  title: string;
  description: string;
  tech_stack: string[];
}

export interface CourseSummary {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  level: string;
  audience: string;
  duration_weeks: number;
  hours_per_week: number;
  format: string;
  key_skills: string[];
  is_sample: boolean;
}

export interface CourseDetail extends CourseSummary {
  prerequisites: string[];
  modules: CourseModule[];
  projects: CourseProject[];
}

export interface CourseListResponse {
  total: number;
  items: CourseSummary[];
  sample_notice: string;
}

export type Course = CourseSummary;

export interface Organization {
  id: number;
  name: string;
  slug: string;
  code: string;
  type: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}
