'use client';

import { getCookie, setCookie, removeCookie } from '../redux/api/baseApi';

export const BRANCH_MANAGER_TOKEN_KEY = 'branch_manager_token';
export const BRANCH_MANAGER_USER_KEY = 'branch_manager_user';

export interface BranchManagerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  branchName?: string;
  branchId?: string;
  shiftStartedAt?: string;
  assignments?: Array<{
    id?: string;
    role: string;
    branch?: { id: string; name: string };
  }>;
}

export const DEMO_BRANCH_MANAGER_USER: BranchManagerUser = {
  id: 'bm-101',
  name: 'Nobin Mille',
  email: 'manager@tavonza.demo',
  role: 'BRANCH_MANAGER',
  branchName: 'Downtown Flagship Branch',
  branchId: 'br-001',
  assignments: [
    {
      id: 'asg-bm-1',
      role: 'BRANCH_MANAGER',
      branch: { id: 'br-001', name: 'Downtown Flagship Branch' },
    },
  ],
};

/**
 * Check if branch manager session is currently active (STRICTLY COOKIES ONLY)
 */
export function isManagerAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;

  const managerToken = getCookie(BRANCH_MANAGER_TOKEN_KEY);
  const accessToken = getCookie('access_token');
  const sessionToken = getCookie('cashier_token');

  return !!(managerToken || accessToken || sessionToken);
}

/**
 * Retrieve cached branch manager profile from Cookies
 */
export function getManagerProfile(): BranchManagerUser {
  const raw = getCookie(BRANCH_MANAGER_USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse manager user session cookie', err);
    }
  }

  return DEMO_BRANCH_MANAGER_USER;
}

/**
 * Log in the branch manager, establishing strictly Cookies session (NO LOCALSTORAGE)
 */
export function loginManagerSession(customUser?: Partial<BranchManagerUser>): BranchManagerUser {
  const existingToken = getCookie(BRANCH_MANAGER_TOKEN_KEY) || getCookie('access_token');
  const token =
    existingToken && !existingToken.startsWith('bm_tok_')
      ? existingToken
      : `bm_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const user: BranchManagerUser = {
    ...DEMO_BRANCH_MANAGER_USER,
    ...customUser,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Store strictly in Cookies (NO LOCALSTORAGE)
  setCookie(BRANCH_MANAGER_TOKEN_KEY, token);
  setCookie('access_token', token);
  setCookie(BRANCH_MANAGER_USER_KEY, JSON.stringify(user));

  return user;
}

/**
 * Terminate the branch manager shift session, purging all Cookies
 */
export function logoutManagerSession(): void {
  removeCookie(BRANCH_MANAGER_TOKEN_KEY);
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie(BRANCH_MANAGER_USER_KEY);
  removeCookie('cashier_token');
}
