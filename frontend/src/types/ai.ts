export type TutorMode = 'HINT' | 'EXPLAIN' | 'CODE_EXAMPLE' | 'DEBUG';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface AITutorRequest {
  prompt: string;
  mode?: TutorMode;
  difficulty?: DifficultyLevel;
  course_id?: number;
}

export interface AITutorResponse {
  response: string;
  mode: TutorMode;
  difficulty: DifficultyLevel;
  tokens_used: number;
  estimated_cost_usd: number;
  model_name: string;
}

export interface RAGCitation {
  document_id: number;
  document_title: string;
  source_filename: string;
  chunk_index: number;
  excerpt: string;
  relevance_score: number;
}

export interface RAGQueryRequest {
  course_id: number;
  query: string;
}

export interface RAGQueryResponse {
  answer: string;
  course_id: number;
  is_grounded: boolean;
  citations: RAGCitation[];
  tokens_used: number;
  estimated_cost_usd: number;
  model_name: string;
}

export interface GeneratedQuestion {
  question_text: string;
  question_type: 'MCQ';
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: DifficultyLevel;
  review_required: boolean;
}

export interface QuestionGeneratorRequest {
  course_id: number;
  topic: string;
  difficulty?: DifficultyLevel;
  count?: number;
  question_type?: string;
}

export interface QuestionGeneratorResponse {
  course_id: number;
  topic: string;
  difficulty: DifficultyLevel;
  questions: GeneratedQuestion[];
  tokens_used: number;
  estimated_cost_usd: number;
  model_name: string;
}

export interface AIUsageStats {
  total_tokens: number;
  total_cost_usd: number;
  calls_count: number;
  daily_quota_limit: number;
  daily_tokens_used: number;
  daily_quota_remaining: number;
  quota_reset_utc: string;
}
