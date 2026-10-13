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

export async function logout(): Promise<void> {
  await clearToken();
}
