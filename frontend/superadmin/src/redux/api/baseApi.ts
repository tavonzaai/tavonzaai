/**
 * 🍪 Generic Cookie Helpers
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  }
}

export function removeCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const SUPERADMIN_TOKEN_KEY = 'superadmin_token';
export const SUPERADMIN_REFRESH_TOKEN_KEY = 'superadmin_refresh_token';
export const SUPERADMIN_USER_KEY = 'superadmin_user';

/**
 * 🍪 Cookie Management for Authentication Tokens (STRICTLY COOKIES ONLY)
 */
export function getAuthToken(): string | null {
  const superAdminToken = getCookie(SUPERADMIN_TOKEN_KEY);
  if (superAdminToken && superAdminToken.trim().length > 0) return superAdminToken;
  const adminToken = getCookie('admin_token');
  if (adminToken && adminToken.trim().length > 0) return adminToken;
  const tavonzaToken = getCookie('tavonza_token') || getCookie('token');
  if (tavonzaToken && tavonzaToken.trim().length > 0) return tavonzaToken;
  return null;
}

export function getRefreshToken(): string | null {
  return (
    getCookie(SUPERADMIN_REFRESH_TOKEN_KEY) ||
    getCookie('admin_refresh_token') ||
    getCookie('tavonza_refresh_token') ||
    getCookie('refresh_token')
  );
}

export function setAuthToken(token: string) {
  setCookie(SUPERADMIN_TOKEN_KEY, token);
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  setAuthToken(tokens.accessToken);
  // Refresh tokens live in HttpOnly cookie tvz_rt_superadmin — never store in JS-readable cookies.
    removeCookie('superadmin_refresh_token');
  removeCookie('admin_refresh_token');
  removeCookie('tavonza_refresh_token');
  removeCookie('refresh_token');
}

export function removeAuthToken() {
  removeCookie(SUPERADMIN_TOKEN_KEY);
  removeCookie(SUPERADMIN_REFRESH_TOKEN_KEY);
  removeCookie(SUPERADMIN_USER_KEY);
  removeCookie('admin_token');
  removeCookie('tavonza_token');
  removeCookie('tavonza_refresh_token');
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const priorAccess = getAuthToken();

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'superadmin' }),
        credentials: 'include',
      });
      if (!res.ok) {
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
  const url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.API_BASE_URL);

  if (url) {
    return String(url).trim().replace(/\/docs(-json)?\/?$/, '').replace(/\/$/, '');
  }

  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

  if (isLocalHost || isDev) {
    return 'http://localhost:3000';
  }

  return 'https://api.tavonza.com';
}

export const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data: T;
  meta?: any;
  errorMessages?: { path: string; message: string }[];
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  statusCode: number;
  data?: any;
  errorCode?: string;
  errorMessages: { path?: string; message: string }[];

  constructor(message: string, status = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
    this.errorCode = data?.errorCode;
    this.errorMessages = Array.isArray(data?.errorMessages) ? data.errorMessages : [];
  }
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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

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
      credentials: 'include',
    });
  } catch (netErr: any) {
    clearTimeout(timeoutId);
    throw new ApiError(netErr?.message || 'Cannot connect to server.', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawJson: any = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !cleanEndpoint.startsWith('/auth/') && !options.__authRetried) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return baseApiFetch<T>(endpoint, { ...options, __authRetried: true });
      }
      removeAuthToken();
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/superadmin/login')
      ) {
        window.location.href = '/superadmin/login';
      }
    }
    let errorMsg = rawJson?.message || rawJson?.error || response.statusText || 'Request failed';
    if (Array.isArray(errorMsg)) errorMsg = errorMsg.join('. ');
    throw new ApiError(errorMsg, response.status, rawJson);
  }

  const dataPayload = (rawJson && typeof rawJson === 'object' && 'data' in rawJson)
    ? rawJson.data
    : (rawJson as T);

  return {
    ...(typeof rawJson === 'object' ? rawJson : {}),
    statusCode: response.status,
    success: true,
    message: rawJson?.message || 'Success',
    data: dataPayload,
  };
}

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      removeAuthToken();
      api.dispatch(rtkBaseApi.util.resetApiState());
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/superadmin/login')) {
        window.location.href = '/superadmin/login';
      }
    }
  }

  return result;
};

export const rtkBaseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'AUTH',
    'USER',
    'TENANT',
    'PLAN',
    'BILLING',
    'METRICS',
    'NOTIFICATION',
    'SETTINGS',
  ],
  endpoints: () => ({}),
});
