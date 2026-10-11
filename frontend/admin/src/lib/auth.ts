import {
  getCookie,
  setCookie,
  removeCookie,
  getAuthToken,
  removeAuthToken,
  ADMIN_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  ADMIN_USER_KEY,
} from '@/redux/api/baseApi';

export { ADMIN_TOKEN_KEY, ADMIN_REFRESH_TOKEN_KEY, ADMIN_USER_KEY };

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  station?: string;
  shiftStartedAt?: string;
  assignments?: Array<{
    id: string;
    role: string;
    branch?: { id: string; name: string };
  }>;
}

export function isAdminAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof document === 'undefined') return null;
  const raw = getCookie(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse admin user session cookie', err);
    return null;
  }
}

export function getAdminProfile(): AdminUser | null {
  return getStoredAdminUser();
}

export function loginAdminSession(customUser?: Partial<AdminUser>): AdminUser {
  const token = getAuthToken();

  const user: AdminUser = {
    id: customUser?.id || '',
    name: customUser?.name || 'Administrator',
    email: customUser?.email || '',
    role: customUser?.role || 'ADMIN',
    assignments: customUser?.assignments || [],
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...customUser,
  };

  if (token) {
    setCookie(ADMIN_TOKEN_KEY, token);
  }
  setCookie(ADMIN_USER_KEY, JSON.stringify(user));

  return user;
}

export function logoutAdminSession(): void {
  removeAuthToken();
}

// Backwards compatibility aliases
export const isCashierAuthenticated = isAdminAuthenticated;
export const getCashierProfile = getAdminProfile;
export const loginCashierSession = loginAdminSession;
export const logoutCashierSession = logoutAdminSession;
export const isWaiterAuthenticated = isAdminAuthenticated;
export const getStoredWaiterUser = getStoredAdminUser;
