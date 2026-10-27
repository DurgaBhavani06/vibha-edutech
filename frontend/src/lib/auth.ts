import { AuthTokens, User, UserRole } from '@/types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://vibha-edutech.onrender.com/api/v1';

const TOKEN_KEY = 'vibha_access_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ tokens: AuthTokens; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    throw new Error(
      `Cannot connect to backend (${API_BASE_URL}). If using Vercel, check NEXT_PUBLIC_API_URL and ensure your backend server on Render is awake.`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned unexpected response (${res.status} ${res.statusText}).`);
  }

  if (!res.ok) {
    throw new Error(data.detail || 'Login failed. Please verify credentials.');
  }

  setStoredToken(data.access_token);

  // Fetch current user details with verified server-side role
  const user = await fetchCurrentUser(data.access_token);
  return { tokens: data, user };
}

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
  organization_code?: string;
}): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    throw new Error(
      `Cannot connect to backend (${API_BASE_URL}). If using Vercel, check NEXT_PUBLIC_API_URL and ensure your backend server on Render is awake.`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned unexpected response (${res.status} ${res.statusText}).`);
  }

  if (!res.ok) {
    let errorMsg = 'Registration failed.';
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((d: any) => d.msg).join(', ');
      } else {
        errorMsg = data.detail;
      }
    }
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchCurrentUser(token?: string): Promise<User> {
  const activeToken = token || getStoredToken();
  if (!activeToken) {
    throw new Error('No authentication token available.');
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  if (!res.ok) {
    removeStoredToken();
    throw new Error('Session expired or unauthorized.');
  }

  return await res.json();
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {
    // Ignore network error on logout
  } finally {
    removeStoredToken();
  }
}

export async function requestPasswordReset(email: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function confirmPasswordReset(token: string, new_password: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Password reset failed.');
  }
  return data;
}
