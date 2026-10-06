



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

export function getRefreshToken(): string | null {
  return getCookie('refresh_token');
}

export function setAuthToken(token: string) {
  setCookie('access_token', token);
  setCookie('customer_session', token);
}

export function setAuthTokens(tokens: { accessToken: string; refreshToken?: string }) {
  setCookie('access_token', tokens.accessToken);
  setCookie('customer_session', tokens.accessToken);
  if (tokens.refreshToken) {
    setCookie('refresh_token', tokens.refreshToken);
  }
}

export function removeAuthToken() {
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie('customer_session');
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
        'Server took too long to respond (504 Gateway Timeout). The server may be processing your request or sending email verification. If you registered, please try logging in.',
        504
      );
    }
    const is504 = String(netErr?.message || '').includes('504');
    const msg = is504
      ? 'The server gateway timed out (504). Please try again or log in if your account is already created.'
      : (netErr?.message || 'Network error: Unable to reach the Tavonza server.');
    throw new ApiError(msg, is504 ? 504 : 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawJson = await response.json().catch(() => null);

  if (!response.ok) {
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

