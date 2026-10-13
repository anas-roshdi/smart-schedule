import { clearToken, getToken } from './token-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: { field: string; message: string }[];
  details?: unknown;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    errors?: { field: string; message: string }[];
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.errors = params.errors;
    this.details = params.details;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  unauthorizedHandler = fn;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const baseUrlClean = BASE_URL.replace(/\/+$/, '');
  const pathClean = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrlClean}${pathClean}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const isAuth = options?.auth ?? false;
  if (isAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: options?.method || (options?.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    if (response.ok) {
      const text = await response.text();
      if (!text) return undefined as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new ApiError({ status: response.status, message: 'استجابة غير صالحة من الخادم' });
      }
    }

    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response
    }

    if (response.status === 401 && isAuth) {
      await clearToken();
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    const message =
      errorData && typeof errorData.message === 'string' && errorData.message.trim()
        ? errorData.message
        : 'حدث خطأ غير متوقع';

    throw new ApiError({
      status: response.status,
      message,
      code: errorData?.code,
      errors: errorData?.errors,
      details: errorData?.details,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    throw new ApiError({
      status: 0,
      message: isTimeout
        ? 'انتهت مهلة الاتصال بالخادم، حاول مرة أخرى'
        : 'تعذر الاتصال بالخادم، تأكد من اتصالك بالشبكة',
      details: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
