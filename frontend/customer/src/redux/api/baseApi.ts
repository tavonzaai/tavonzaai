



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
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
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

export function setAuthToken(token: string) {
 
  setCookie('access_token', token  );
  setCookie('customer_session', token);
}

export function removeAuthToken() {
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie('customer_session');
}

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || 'https://api.tavonza.com/docs').replace(/\/$/, '');
}

export const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: any;
}

export async function baseApiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Sends HttpOnly cookies alongside Authorization header
  });

  const resData: ApiResponse<T> = await response.json().catch(() => ({
    statusCode: response.status,
    success: response.ok,
    message: response.statusText || 'An error occurred',
    data: null as any,
  }));

  if (!response.ok || (resData as any).success === false || (resData.statusCode && resData.statusCode >= 400)) {
    const errorMsg =
      resData.message ||
      (Array.isArray((resData as any).message) ? (resData as any).message[0] : 'Request failed');
    throw new Error(errorMsg);
  }

  return resData;
}

