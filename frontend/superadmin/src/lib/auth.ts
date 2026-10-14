import {
  getCookie,
  setCookie,
  removeCookie,
  getAuthToken,
  removeAuthToken,
  SUPERADMIN_TOKEN_KEY,
  SUPERADMIN_REFRESH_TOKEN_KEY,
  SUPERADMIN_USER_KEY,
} from '@/redux/api/baseApi';

export { SUPERADMIN_TOKEN_KEY, SUPERADMIN_REFRESH_TOKEN_KEY, SUPERADMIN_USER_KEY };

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function isSuperAdminAuthenticated(): boolean {
  if (typeof document === 'undefined') return true;
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
}

export function getStoredSuperAdminUser(): SuperAdminUser | null {
  if (typeof document === 'undefined') return null;
  const raw = getCookie(SUPERADMIN_USER_KEY) || getCookie('admin_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logoutSuperAdminSession(): void {
  removeAuthToken();
}
