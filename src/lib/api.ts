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

type ColdStartListener = (isColdStarting: boolean) => void;
const coldStartListeners = new Set<ColdStartListener>();

export function subscribeColdStart(listener: ColdStartListener): () => void {
  coldStartListeners.add(listener);
  return () => {
    coldStartListeners.delete(listener);
  };
}

let slowRequestsCount = 0;

function notifyColdStart(active: boolean) {
  coldStartListeners.forEach((fn) => {
    try {
      fn(active);
    } catch {
      // Ignore listener errors
    }
  });
}

function startSlowTracker(): () => void {
  let triggered = false;
  const timer = setTimeout(() => {
    triggered = true;
    slowRequestsCount++;
    if (slowRequestsCount === 1) {
      notifyColdStart(true);
    }
  }, 4000);

  return () => {
    clearTimeout(timer);
    if (triggered) {
      slowRequestsCount = Math.max(0, slowRequestsCount - 1);
      if (slowRequestsCount === 0) {
        notifyColdStart(false);
      }
    }
  };
}

export function pingHealth(): void {
  const baseUrlClean = BASE_URL.replace(/\/+$/, '');
  const url = `${baseUrlClean}/health`;
  fetch(url).catch(() => {});
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
}

export async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const baseUrlClean = BASE_URL.replace(/\/+$/, '');
  const pathClean = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrlClean}${pathClean}`;

  const method = (options?.method || (options?.body !== undefined ? 'POST' : 'GET')).toUpperCase();
  const isGet = method === 'GET';
  const isAuth = options?.auth ?? false;
  const timeoutMs = options?.timeoutMs ?? 60000;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const stopSlowTracker = startSlowTracker();

  try {
    let lastError: unknown = null;
    const maxAttempts = isGet ? 2 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        // Wait 1 second before retrying GET
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        // Retry GET once on server waking up / gateway error (502, 503, 504)
        if (
          isGet &&
          attempt === 0 &&
          (response.status === 502 || response.status === 503 || response.status === 504)
        ) {
          continue;
        }

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

        let message = 'حدث خطأ غير متوقع';
        if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
          message = errorData.message;
        } else if (response.status === 502 || response.status === 503 || response.status === 504) {
          message = 'الخادم غير متاح حالياً، حاول مرة أخرى';
        }

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

        // Network error / timeout: retry GET once if attempt is 0
        if (isGet && attempt === 0) {
          lastError = error;
          continue;
        }

        const isTimeout = error instanceof Error && error.name === 'AbortError';
        throw new ApiError({
          status: 0,
          message: isTimeout
            ? 'الخادم لم يستجب، حاول مرة أخرى'
            : 'تعذر الاتصال بالخادم، تأكد من اتصالك بالشبكة',
          details: error,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }

    const isTimeout = lastError instanceof Error && lastError.name === 'AbortError';
    throw new ApiError({
      status: 0,
      message: isTimeout
        ? 'الخادم لم يستجب، حاول مرة أخرى'
        : 'تعذر الاتصال بالخادم، تأكد من اتصالك بالشبكة',
      details: lastError,
    });
  } finally {
    stopSlowTracker();
  }
}
