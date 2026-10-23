import { request } from './api';
import { clearToken, setToken } from './token-storage';
import type { RegisterPayload } from '../components/auth/register';

export interface Student {
  id?: string | number;
  name: string;
  email: string;
  gender?: string;
  studentId?: string;
  major?: string;
  academicLevel?: number;
  phone?: string;
  dob?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  student: Student;
}

export interface MeResponse {
  student: Student;
}

export async function login(email: string, password: string): Promise<Student> {
  const res = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (res.token) {
    await setToken(res.token);
  }

  return res.student;
}

export async function register(payload: RegisterPayload): Promise<Student> {
  const res = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });

  return res.student;
}

export async function fetchMe(): Promise<Student> {
  const res = await request<MeResponse>('/api/auth/me', {
    method: 'GET',
    auth: true,
  });

  return res.student;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  gender?: string;
  studentId?: string;
  major?: string;
  academicLevel?: number | string;
  phone?: string;
  dob?: string;
}

export async function updateProfile(patch: UpdateProfilePayload): Promise<Student> {
  const res = await request<{ student: Student }>('/api/auth/me', {
    method: 'PATCH',
    body: patch,
    auth: true,
  });

  return res.student;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
  });
}

export async function verifyResetCode(email: string, code: string): Promise<string> {
  const res = await request<{ resetToken: string }>('/api/auth/verify-code', {
    method: 'POST',
    body: { email, code },
    auth: false,
  });

  return res.resetToken;
}

export async function resetPassword(
  resetToken: string,
  password: string
): Promise<{ message: string }> {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: { resetToken, password },
    auth: false,
  });
}

export async function logout(): Promise<void> {
  await clearToken();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<string> {
  const res = await request<{ message: string; token: string }>('/api/auth/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
    auth: true,
  });

  if (res.token) {
    await setToken(res.token);
  }

  return res.message;
}

export async function deleteAccount(password: string): Promise<{ message?: string }> {
  return request<{ message?: string }>('/api/auth/delete-account', {
    method: 'POST',
    body: { password },
    auth: true,
  });
}
