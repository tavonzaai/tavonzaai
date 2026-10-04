'use client';

import { getCookie, setCookie, removeCookie } from '@/redux/api/baseApi';

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
export const ADMIN_USER_KEY = 'admin_user';

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

export const DEMO_ADMIN_USER: AdminUser = {
  id: 'adm-101',
  name: 'System Administrator',
  email: 'euhan.dev@gmail.com',
  role: 'SUPER_ADMIN',
  assignments: [
    {
      id: 'asg-adm-1',
      role: 'SUPER_ADMIN',
      branch: { id: 'br-hq', name: 'Global HQ' },
    },
  ],
};

export function isAdminAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const token = getCookie(ADMIN_TOKEN_KEY);
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
  const existingToken = getCookie(ADMIN_TOKEN_KEY);
  // Keep existing JWT access token if set by rawAuthApi.login, otherwise generate demo token
  const token = (existingToken && !existingToken.startsWith('adm_tok_'))
    ? existingToken
    : `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const user: AdminUser = {
    ...DEMO_ADMIN_USER,
    ...customUser,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  setCookie(ADMIN_TOKEN_KEY, token);
  setCookie(ADMIN_USER_KEY, JSON.stringify(user));

  return user;
}

export function logoutAdminSession(): void {
  removeCookie(ADMIN_TOKEN_KEY);
  removeCookie(ADMIN_USER_KEY);
  removeCookie(ADMIN_REFRESH_TOKEN_KEY);
}

// Backwards compatibility aliases
export const isCashierAuthenticated = isAdminAuthenticated;
export const getCashierProfile = getAdminProfile;
export const loginCashierSession = loginAdminSession;
export const logoutCashierSession = logoutAdminSession;
export const isWaiterAuthenticated = isAdminAuthenticated;
export const getStoredWaiterUser = getStoredAdminUser;
