import {
  CollegeStudent,
  CollegeBatchCreateInput,
  CollegePerformanceReport,
  TrainingRequest,
  TrainingRequestInput,
} from '@/types/college';
import { Batch } from '@/types/assessment';
import { Organization } from '@/types';
import { getStoredToken } from './auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(token?: string): Record<string, string> {
  const activeToken = token || getStoredToken();
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
}

export async function fetchMyCollegeProfile(token?: string): Promise<Organization | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/colleges/my`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateCollegeProfile(
  orgId: number,
  payload: { website?: string; contact_email?: string; contact_phone?: string; address?: string },
  token?: string
): Promise<Organization> {
  const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to update college profile');
  }
  return data;
}

export async function fetchCollegeStudents(
  orgId: number,
  search?: string,
  token?: string
): Promise<CollegeStudent[]> {
  try {
    let url = `${API_BASE_URL}/colleges/${orgId}/students`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCollegeBatches(
  orgId: number,
  token?: string
): Promise<Batch[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/batches`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createCollegeBatch(
  orgId: number,
  payload: CollegeBatchCreateInput,
  token?: string
): Promise<Batch> {
  const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to create college cohort batch');
  }
  return data;
}

export async function fetchCollegePerformanceReport(
  orgId: number,
  token?: string
): Promise<CollegePerformanceReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/reports`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getCollegeComplianceCsvExportUrl(orgId: number): string {
  return `${API_BASE_URL}/colleges/${orgId}/reports/export`;
}

export async function submitCollegeTrainingRequest(
  orgId: number,
  payload: TrainingRequestInput,
  token?: string
): Promise<TrainingRequest> {
  const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/training-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to submit training proposal');
  }
  return data;
}

export async function fetchCollegeTrainingRequests(
  orgId: number,
  token?: string
): Promise<TrainingRequest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/colleges/${orgId}/training-requests`, {
      headers: getAuthHeader(token),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
