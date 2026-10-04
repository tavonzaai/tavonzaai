/**
 * 🍪 Generic Cookie Helpers (Strictly Cookies Only)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

export function removeCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
}

/**
 * 🍪 Cookie Management for Authentication Tokens (STRICTLY COOKIES ONLY)
 */
export function getAuthToken(): string | null {
  // 1. Check access_token cookie
  const token = getCookie('access_token');
  if (token) return token;

  // 2. Check branch_manager_token cookie
  const managerToken = getCookie('branch_manager_token');
  if (managerToken) return managerToken;

  // 3. Fallback to cashier_token or general auth token
  const cashierToken = getCookie('cashier_token');
  if (cashierToken) return cashierToken;

  return null;
}

export function getRefreshToken(): string | null {
  return getCookie('refresh_token');
}

export function setAuthToken(token: string) {
  setCookie('access_token', token);
  setCookie('branch_manager_token', token);
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  setAuthToken(tokens.accessToken);
  if (tokens.refreshToken) {
    setCookie('refresh_token', tokens.refreshToken);
  }
}

export function removeAuthToken() {
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie('branch_manager_token');
  removeCookie('branch_manager_user');
  removeCookie('cashier_token');
}

export function getApiBaseUrl(): string {
  let url =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.API_BASE_URL) ||
    'https://prod-api.tavonza.com';

  url = String(url).trim().replace(/\/docs(-json)?\/?$/, '').replace(/\/$/, '');
  return url || 'https://prod-api.tavonza.com';
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
  isConflict: boolean;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(message: string, status = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
    this.isConflict = status === 409;
    this.isTimeout = status === 408 || status === 504;
    this.isNetworkError = status === 0;
  }
}

/**
 * 📡 Base API Fetch Utility
 */
export async function baseApiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(err?.message || 'Network connection failed', 0);
  }

  // Handle 401 Unauthorized / Token Refresh
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken =
            refreshData?.data?.accessToken || refreshData?.accessToken || refreshData?.data?.token;

          if (newAccessToken) {
            setAuthTokens({
              accessToken: newAccessToken,
              refreshToken: refreshData?.data?.refreshToken || refreshToken,
            });

            headers['Authorization'] = `Bearer ${newAccessToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            const retryData = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              throw new ApiError(retryData?.message || 'Request failed after refresh', retryRes.status, retryData);
            }
            return retryData;
          }
        }
      } catch {}
    }

    removeAuthToken();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  // Parse JSON response
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      data?.errorMessages?.[0]?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as ApiResponse<T>;
}
