'use client';

import { getCookie, setCookie, removeCookie } from '@/redux/api/baseApi';

export const WAITER_TOKEN_KEY = 'waiter_token';
export const WAITER_USER_KEY = 'waiter_user';

export interface WaiterUser {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  branchId?: string;
  branchName?: string;
  shiftStartedAt?: string;
  assignments?: Array<{
    id: string;
    role: string;
    branchId?: string;
    branchName?: string;
    branch?: { id: string; name: string };
  }>;
}

export function isWaiterAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const waiterToken = getCookie(WAITER_TOKEN_KEY);
  return Boolean(waiterToken && waiterToken.trim().length > 0);
}

/**
 * Retrieve cached waiter profile from Cookies (or null if unauthenticated)
 */
export function getStoredWaiterUser(): WaiterUser | null {
  if (typeof document === 'undefined') return null;
  const raw = getCookie(WAITER_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse waiter user session cookie', err);
    return null;
  }
}

export function getWaiterProfile(): WaiterUser | null {
  return getStoredWaiterUser();
}

/**
 * Log in the waiter, establishing strictly Cookies session (NO LOCALSTORAGE)
 */
export function loginWaiterSession(customUser?: Partial<WaiterUser>): WaiterUser {
  const existingToken = getCookie(WAITER_TOKEN_KEY);
  // Profile cache only — authentication requires a real access JWT from /auth/login.
  if (!existingToken || existingToken.startsWith('wtr_tok_')) {
    throw new Error('Waiter login requires a valid API access token. Sign in through /auth/login.');
  }

  const branchId =
    customUser?.branchId ||
    customUser?.assignments?.[0]?.branchId ||
    customUser?.assignments?.[0]?.branch?.id ||
    'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

  const user: WaiterUser = {
    id: customUser?.id || '',
    name: customUser?.name || 'Waiter Staff',
    email: customUser?.email || '',
    role: customUser?.role || 'WAITER',
    station: customUser?.station || customUser?.branchName || 'Downtown Flagship HQ',
    branchId,
    branchName: customUser?.branchName || 'Downtown Flagship HQ',
    assignments: customUser?.assignments || [],
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...customUser,
  };

  setCookie(WAITER_USER_KEY, JSON.stringify(user));
  if (branchId) {
    setCookie('waiter_branch_id', branchId);
    setCookie('active_branch_id', branchId);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('waiter_branch_id', branchId);
        localStorage.setItem('active_branch_id', branchId);
      } catch {}
    }
  }

  // Clear any stale table cookies from other sessions/branches
  removeCookie('active_table_id');
  removeCookie('table_id');
  removeCookie('waiter_table_id');
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('active_table_id');
      localStorage.removeItem('table_id');
      localStorage.removeItem('waiter_table_id');
    } catch {}
  }

  return user;
}

/**
 * Terminate the waiter shift session, purging all Waiter Cookies (NO LOCALSTORAGE)
 */
export function logoutWaiterSession(): void {
  removeCookie(WAITER_TOKEN_KEY);
  removeCookie(WAITER_USER_KEY);
  removeCookie('waiter_refresh_token');
  removeCookie('waiter_branch_id');
  removeCookie('active_branch_id');
  removeCookie('active_table_id');
  removeCookie('table_id');
  removeCookie('waiter_table_id');
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('waiter_branch_id');
      localStorage.removeItem('active_branch_id');
      localStorage.removeItem('active_table_id');
      localStorage.removeItem('table_id');
      localStorage.removeItem('waiter_table_id');
    } catch {}
  }
}

// Backwards compatibility aliases
export const isCashierAuthenticated = isWaiterAuthenticated;
export const getCashierProfile = getWaiterProfile;
export const loginCashierSession = loginWaiterSession;
export const logoutCashierSession = logoutWaiterSession;
