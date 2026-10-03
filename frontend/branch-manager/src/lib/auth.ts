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
  id: '45e65de4-65e0-4eef-89e9-4e256fec3870',
  name: 'Marcus Vance',
  email: 'manager@tavonza.ai',
  role: 'BRANCH_MANAGER',
  branchName: 'Downtown HQ',
  branchId: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  assignments: [
    {
      id: '6c7dacf8-8dca-4fda-b532-5bd21d81ee7c',
      role: 'BRANCH_MANAGER',
      branch: { id: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', name: 'Downtown HQ' },
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

  const validBranchId =
    customUser?.branchId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(customUser.branchId)
      ? customUser.branchId
      : 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

  const user: BranchManagerUser = {
    ...DEMO_BRANCH_MANAGER_USER,
    ...customUser,
    branchId: validBranchId,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Store strictly in Cookies (NO LOCALSTORAGE)
  setCookie(BRANCH_MANAGER_TOKEN_KEY, token);
  setCookie('access_token', token);
  setCookie(BRANCH_MANAGER_USER_KEY, JSON.stringify(user));
  setCookie('tavonza_branch_id', validBranchId);
  setCookie('branch_id', validBranchId);

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
