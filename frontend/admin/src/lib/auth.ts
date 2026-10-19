import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
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

/** Profile must come from Redux / GET /users/me — never cookies. */
export function getStoredAdminUser(): AdminUser | null {
  return null;
}

export function getAdminProfile(): AdminUser | null {
  return null;
}

/**
 * Persist only the access token. User profile stays in Redux from the API.
 */
export function loginAdminSession(customUser?: Partial<AdminUser>): AdminUser {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }

  return {
    id: customUser?.id || '',
    name: customUser?.name || 'Administrator',
    email: customUser?.email || '',
    role: customUser?.role || 'ADMIN',
    assignments: customUser?.assignments || [],
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...customUser,
  };
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
