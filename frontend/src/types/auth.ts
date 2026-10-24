export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TRAINER'
  | 'COLLEGE_COORDINATOR'
  | 'STUDENT'
  | 'PROFESSIONAL_LEARNER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  organization_id?: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
