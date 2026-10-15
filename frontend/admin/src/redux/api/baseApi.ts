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

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
export const ADMIN_USER_KEY = 'admin_user';

/**
 * 🍪 Cookie Management for Authentication Tokens (STRICTLY COOKIES ONLY - NO LOCALSTORAGE)
 */
export function getAuthToken(): string | null {
  const adminToken = getCookie(ADMIN_TOKEN_KEY);
  if (adminToken && adminToken.trim().length > 0) return adminToken;
  const tavonzaToken = getCookie('tavonza_token') || getCookie('token');
  if (tavonzaToken && tavonzaToken.trim().length > 0) return tavonzaToken;
  return null;
}

export function getRefreshToken(): string | null {
  return (
    getCookie(ADMIN_REFRESH_TOKEN_KEY) ||
    getCookie('admin_refresh_token') ||
    getCookie('tavonza_refresh_token') ||
    getCookie('refresh_token')
  );
}

export function setAuthToken(token: string) {
  setCookie(ADMIN_TOKEN_KEY, token);
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  setAuthToken(tokens.accessToken);
  if (tokens.refreshToken) {
    setCookie(ADMIN_REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function removeAuthToken() {
  removeCookie(ADMIN_TOKEN_KEY);
  removeCookie(ADMIN_REFRESH_TOKEN_KEY);
  removeCookie(ADMIN_USER_KEY);
  removeCookie('tavonza_token');
  removeCookie('tavonza_refresh_token');
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAuthSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!res.ok) {
        removeAuthToken();
        return false;
      }

      const json = await res.json().catch(() => null);
      const data = json?.data || json;
      const newAccessToken = data?.accessToken || data?.access_token;
      const newRefreshToken = data?.refreshToken || data?.refresh_token || refreshToken;

      if (newAccessToken) {
        setAuthTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
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

export function getCustomerAppUrl(): string {
  const env =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CUSTOMER_APP_URL) ||
    (typeof process !== 'undefined' && process.env?.CUSTOMER_APP_URL);
  if (env) return String(env).trim().replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      return 'http://localhost:3100';
    }
    if (host.includes('tavonza.com')) {
      if (host.includes('prod-') || host.startsWith('prod.')) return 'https://prod.tavonza.com';
      return 'https://tavonza.com';
    }
    const parts = host.split('.');
    if (parts.length > 2) {
      return `${window.location.protocol}//${parts.slice(1).join('.')}`;
    }
    return `${window.location.protocol}//${host}`;
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return 'https://tavonza.com';
  }
  return 'http://localhost:3100';
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
  isConflict: boolean;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(message: string, status = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
    this.errorCode = data?.errorCode;
    this.errorMessages = Array.isArray(data?.errorMessages) ? data.errorMessages : [];
    this.isConflict = status === 409 || String(message).toLowerCase().includes('already exists');
    this.isTimeout = status === 504 || status === 408 || String(message).toLowerCase().includes('timeout');
    this.isNetworkError = status === 0;
  }
}

export async function baseApiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
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
    if (netErr?.name === 'AbortError' || String(netErr?.message || '').toLowerCase().includes('abort')) {
      throw new ApiError(
        'Server took too long to respond (504 Gateway Timeout). Please check your connection or try again in a few moments.',
        504
      );
    }
    const is504 = String(netErr?.message || '').includes('504');
    const msg = is504
      ? 'The server gateway timed out (504). Please try again or log in if your account was already created.'
      : (netErr?.message || 'Cannot connect to the Tavonza server. Please ensure the backend is running.');
    throw new ApiError(msg, is504 ? 504 : 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawJson: any = await response.json().catch(() => null);

  if (!response.ok) {
    if (
      response.status === 401 &&
      !cleanEndpoint.includes('/auth/login') &&
      !cleanEndpoint.includes('/auth/refresh') &&
      !(options as any)?._isRetry
    ) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return baseApiFetch<T>(endpoint, {
          ...options,
          _isRetry: true,
        } as any);
      }
      removeAuthToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (response.status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    let errorMsg = 'Request failed';
    if (rawJson?.message) {
      errorMsg = Array.isArray(rawJson.message) ? rawJson.message.join('. ') : rawJson.message;
    } else if (rawJson?.error) {
      errorMsg = rawJson.error;
    } else if (rawJson?.errorMessages && Array.isArray(rawJson.errorMessages) && rawJson.errorMessages.length > 0) {
      const details = rawJson.errorMessages.map((e: any) => e.message || String(e)).filter(Boolean);
      if (details.length > 0) {
        errorMsg = details.join('. ');
      }
    } else if (response.status === 409) {
      errorMsg = 'An account with this email already exists. Please log in.';
    } else if (response.status === 504) {
      errorMsg = 'Server gateway timed out (504). Please try again or try logging in.';
    } else if (response.statusText) {
      errorMsg = response.statusText;
    }
    throw new ApiError(errorMsg || 'Request failed. Please try again.', response.status, rawJson);
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
    const url = typeof args === 'string' ? args : args.url;
    if (!url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        removeAuthToken();
        api.dispatch(rtkBaseApi.util.resetApiState());
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
  }

  return result;
};

export const rtkBaseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'TABLE',
    'ORDER',
    'ORDER_ITEM',
    'PAYMENT',
    'NOTIFICATION',
    'DASHBOARD',
    'MENU',
    'USER',
    'ORGANIZATION',
    'BRANCH',
    'AUTH',
    'RESTAURANT',
    'STAFF',
    'ANALYTICS',
    'ROLE',
    'PERMISSION',
  ],
  endpoints: () => ({}),
});

export const notificationsApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { page?: number; limit?: number; isRead?: boolean } | void>({
      query: (params) => ({
        url: '/notifications',
        params: params || undefined,
      }),
      providesTags: ['NOTIFICATION'],
    }),
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['NOTIFICATION'],
    }),
    markAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['NOTIFICATION'],
    }),
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['NOTIFICATION'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;

