export type TrainingRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'REJECTED';

export interface CollegeStudent {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  registered_at: string;
  is_active: boolean;
  enrolled_courses_count: number;
  completed_courses_count: number;
  certificates_count: number;
  active_batch_names: string[];
}

export interface CollegeBatchCreateInput {
  name: string;
  code: string;
  course_id: number;
  trainer_id?: number;
  max_students?: number;
  start_date?: string;
  end_date?: string;
}

export interface CollegeBatchReportItem {
  batch_id: number;
  batch_name: string;
  batch_code: string;
  course_title: string;
  trainer_name?: string;
  enrolled_count: number;
  attendance_rate: number;
  quiz_pass_rate: number;
}

export interface NaacNbaCriterionSummary {
  criterion_1_curricular_aspects: {
    value_added_courses_enrolled: number;
    percentage_of_students_completing: string;
    curriculum_enrichment_status: string;
  };
  criterion_2_teaching_learning_evaluation: {
    experiential_project_learning: string;
    average_cohort_attendance_rate: string;
    continuous_assessment_pass_rate: string;
  };
  accreditation_compliance_statement: string;
}

export interface CollegePerformanceReport {
  organization_id: number;
  organization_name: string;
  organization_code: string;
  total_registered_students: number;
  total_active_cohorts: number;
  average_attendance_percentage: number;
  average_quiz_score_percentage: number;
  total_certificates_issued: number;
  naac_nba_criterion_summary: NaacNbaCriterionSummary;
  cohorts: CollegeBatchReportItem[];
}

export interface TrainingRequestInput {
  title: string;
  course_id?: number;
  target_audience: string;
  estimated_students: number;
  preferred_start_date?: string;
  training_mode: string;
  notes?: string;
}

export interface TrainingRequest {
  id: number;
  organization_id: number;
  organization_name?: string;
  requester_id?: number;
  requester_name?: string;
  course_id?: number;
  course_title?: string;
  title: string;
  target_audience: string;
  estimated_students: number;
  preferred_start_date?: string;
  training_mode: string;
  notes?: string;
  status: TrainingRequestStatus;
  created_at: string;
}
