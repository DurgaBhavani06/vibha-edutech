import {
  AITutorRequest,
  AITutorResponse,
  RAGQueryRequest,
  RAGQueryResponse,
  QuestionGeneratorRequest,
  QuestionGeneratorResponse,
  AIUsageStats,
} from '@/types/ai';
import { getStoredToken } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(token?: string): Record<string, string> {
  const activeToken = token || getStoredToken();
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
}

export async function askAITutor(
  payload: AITutorRequest,
  token?: string
): Promise<AITutorResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'VIBHA AI Tutor request failed.');
  }
  return data;
}

export async function queryCourseRAG(
  payload: RAGQueryRequest,
  token?: string
): Promise<RAGQueryResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/rag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Course Document Assistant query failed.');
  }
  return data;
}

export async function generateAssessmentQuestions(
  payload: QuestionGeneratorRequest,
  token?: string
): Promise<QuestionGeneratorResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Question Generator failed.');
  }
  return data;
}

export async function fetchAIUsageStats(token?: string): Promise<AIUsageStats> {
  const res = await fetch(`${API_BASE_URL}/ai/usage`, {
    headers: getAuthHeader(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch AI usage statistics.');
  }
  return data;
}
