



import { toast } from 'sonner';

/**
 * 🍪 Generic Cookie Helpers
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string,) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  }
}

export function removeCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
  }
}

/**
 * 🍪 Cookie Management for Authentication Tokens (STRICTLY COOKIES ONLY - NO LOCALSTORAGE)
 */
export function getAuthToken(): string | null {
  // 1. Check access_token cookie
  const token = getCookie('access_token');
  if (token) return token;

  // 2. Check customer_session cookie
  const sessionToken = getCookie('customer_session');
  if (sessionToken) return sessionToken;

  return null;
}

export function getRefreshToken(): string | null {
  return getCookie('refresh_token');
}

export function setAuthToken(token: string) {
  setCookie('access_token', token);
  setCookie('customer_session', token);
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  // Prefer max-age from the JWT exp claim when present.
  let maxAge: number | undefined;
  try {
    const parts = tokens.accessToken.split('.');
    if (parts[1]) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp === 'number') {
        maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
      }
    }
  } catch {
    // ignore decode errors
  }
  if (typeof document !== 'undefined') {
    const age = maxAge !== undefined ? `; max-age=${maxAge}` : '';
    document.cookie = `access_token=${encodeURIComponent(tokens.accessToken)}; path=/; SameSite=Lax${age}`;
    document.cookie = `customer_session=${encodeURIComponent(tokens.accessToken)}; path=/; SameSite=Lax${age}`;
  }
  // Refresh tokens are HttpOnly (tvz_rt_customer) — never store them in JS cookies.
  removeCookie('refresh_token');
}

export function removeAuthToken() {
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie('customer_session');
  removeCookie('tavonza_customer_session_id');
}

let refreshPromise: Promise<boolean> | null = null;

/** Cookie-based refresh with single-flight dedupe. On failure, clears auth. */
export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const priorAccess = getAuthToken();

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'customer' }),
        credentials: 'include',
      });
      if (!res.ok) {
        // Another tab may have refreshed already — reuse the newer access cookie.
        const current = getAuthToken();
        if (current && current !== priorAccess) return true;
        removeAuthToken();
        return false;
      }
      const json = await res.json().catch(() => null);
      const data = json?.data || json;
      const newAccess = data?.accessToken || data?.access_token;
      if (newAccess) {
        setAuthTokens({ accessToken: newAccess });
        return true;
      }
      removeAuthToken();
      return false;
    } catch {
      removeAuthToken();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function getApiBaseUrl(): string {
  let url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.API_BASE_URL);

  if (url) {
    const cleanUrl = String(url).trim().replace(/\/docs(-json)?\/?$/, '').replace(/\/$/, '');
    if (cleanUrl && !cleanUrl.includes('localhost:3000') && !cleanUrl.includes('127.0.0.1:3000')) {
      return cleanUrl;
    }
  }

  // return 'http://localhost:3000';
  return 'https://api.tavonza.com';
}

export const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: any;
}

export class ApiError extends Error {
  status: number;
  statusCode: number;
  data?: any;
  isConflict: boolean;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(message: string, status = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
    this.isConflict = status === 409 || String(message).toLowerCase().includes('already exists');
    this.isTimeout = status === 504 || status === 408 || String(message).toLowerCase().includes('timeout');
    this.isNetworkError = status === 0;
  }
}

export interface BaseApiFetchOptions extends RequestInit {
  skipToast?: boolean;
}

export async function baseApiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { __authRetried?: boolean } = {}
): Promise<ApiResponse<T> & T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const baseUrl = getApiBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If hitting prod-api.tavonza.com, strip legacy /api/v1 prefix as prod routes are mounted at root
  if (baseUrl.includes('prod-api.tavonza.com') && cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
  }

  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // Set up 20-second timeout controller so requests don't hang indefinitely on 504 Gateway Timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 20000);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: 'include', // Sends HttpOnly cookies alongside Authorization header
    });
  } catch (netErr: any) {
    clearTimeout(timeoutId);
    let errorMsg = 'Network error: Unable to reach the Tavonza server.';
    let status = 0;
    if (netErr?.name === 'AbortError' || String(netErr?.message || '').toLowerCase().includes('abort')) {
      errorMsg = 'Server took too long to respond (504 Gateway Timeout). Please try again.';
      status = 504;
    } else if (String(netErr?.message || '').includes('504')) {
      errorMsg = 'The server gateway timed out (504). Please try again.';
      status = 504;
    } else if (netErr?.message) {
      errorMsg = netErr.message;
    }

    if (!options.skipToast && typeof window !== 'undefined') {
      try {
        toast.error(errorMsg);
      } catch {}
    }

    throw new ApiError(errorMsg, status);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawJson = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !cleanEndpoint.startsWith('/auth/') && !options.__authRetried) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return baseApiFetch<T>(endpoint, { ...options, __authRetried: true });
      }
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    let errorMsg = 'Request failed';
    if (rawJson?.message) {
      errorMsg = Array.isArray(rawJson.message) ? rawJson.message.join('. ') : rawJson.message;
    } else if (rawJson?.error) {
      errorMsg = rawJson.error;
    } else if (response.status === 409) {
      errorMsg = 'An account with this email already exists. Please log in.';
    } else if (response.status === 504) {
      errorMsg = 'Server gateway timed out (504). Please try again or try logging in.';
    } else if (response.statusText) {
      errorMsg = response.statusText;
    }

    if (!options.skipToast && typeof window !== 'undefined') {
      try {
        toast.error(errorMsg);
      } catch {}
    }

    throw new ApiError(errorMsg, response.status, rawJson);
  }

  const dataPayload = (rawJson && typeof rawJson === 'object' && 'data' in rawJson)
    ? rawJson.data
    : (rawJson as T);

  const resData: any = {
    ...(typeof rawJson === 'object' ? rawJson : {}),
    statusCode: response.status,
    success: true,
    message: rawJson?.message || 'Success',
    data: dataPayload,
    meta: rawJson?.meta,
  };

  return resData;
}

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const rtkBaseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'TABLE',
    'ORDER',
    'ORDER_ITEM',
    'PAYMENT',
    'MENU',
    'USER',
    'NOTIFICATION',
  ],
  endpoints: () => ({}),
});

