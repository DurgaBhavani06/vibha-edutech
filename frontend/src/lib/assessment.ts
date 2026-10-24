import {
  Batch,
  BatchDetail,
  AttendanceResponse,
  BatchAttendanceSummary,
  AttendanceRecordInput,
  AssessmentStudent,
  AssessmentAttemptResponse,
  Submission,
  Certificate,
  CertificateVerification,
} from '@/types/assessment';
import { getStoredToken } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(token?: string): Record<string, string> {
  const activeToken = token || getStoredToken();
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
}

// ---------------- Batches ----------------
export async function fetchBatches(token?: string): Promise<Batch[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/batches`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchBatchDetail(
  batchId: number,
  token?: string
): Promise<BatchDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/batches/${batchId}`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------- Attendance ----------------
export async function markBatchAttendance(
  batchId: number,
  sessionDate: string,
  records: AttendanceRecordInput[],
  token?: string
): Promise<AttendanceResponse[]> {
  const res = await fetch(`${API_BASE_URL}/attendance/batch/${batchId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({
      batch_id: batchId,
      session_date: sessionDate,
      records,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to record attendance');
  }
  return await res.json();
}

export async function fetchBatchAttendanceSummary(
  batchId: number,
  token?: string
): Promise<BatchAttendanceSummary | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance/batch/${batchId}`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMyAttendance(token?: string): Promise<AttendanceResponse[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance/my`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ---------------- Assessments ----------------
export async function fetchCourseAssessments(
  courseId: number,
  token?: string
): Promise<AssessmentStudent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/course/${courseId}`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAssessment(
  assessmentId: number,
  token?: string
): Promise<AssessmentStudent | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitAssessmentAttempt(
  assessmentId: number,
  answers: Record<string, string>,
  token?: string
): Promise<AssessmentAttemptResponse> {
  const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/attempt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to submit quiz attempt');
  }
  return data;
}

export async function fetchMyAssessmentAttempts(
  assessmentId: number,
  token?: string
): Promise<AssessmentAttemptResponse[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/attempts/my`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ---------------- Submissions ----------------
export async function submitAssignment(
  payload: {
    course_id: number;
    lesson_id?: number;
    title: string;
    github_url?: string;
    submission_url?: string;
    notes?: string;
  },
  token?: string
): Promise<Submission> {
  const res = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Assignment submission failed');
  }
  return data;
}

export async function fetchMySubmissions(token?: string): Promise<Submission[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/submissions/my`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchPendingSubmissions(token?: string): Promise<Submission[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/submissions/pending`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function gradeSubmission(
  submissionId: number,
  payload: {
    status: 'GRADED' | 'REJECTED' | 'UNDER_REVIEW';
    grade?: number;
    trainer_feedback?: string;
  },
  token?: string
): Promise<Submission> {
  const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}/grade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to grade submission');
  }
  return data;
}

// ---------------- Certificates ----------------
export async function claimCertificate(
  courseId: number,
  token?: string
): Promise<Certificate> {
  const res = await fetch(`${API_BASE_URL}/certificates/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify({ course_id: courseId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Ineligible for certificate');
  }
  return data;
}

export async function fetchMyCertificates(token?: string): Promise<Certificate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/certificates/my`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function verifyCertificatePublic(code: string): Promise<CertificateVerification> {
  const res = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(code)}`);
  return await res.json();
}
