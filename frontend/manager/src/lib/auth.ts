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

export function isManagerAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;

  const managerToken = getCookie(BRANCH_MANAGER_TOKEN_KEY);
  const accessToken = getCookie('access_token');
  const rawUser = getCookie(BRANCH_MANAGER_USER_KEY);

  const token = managerToken || accessToken;
  return !!(token && token.trim().length > 0 && rawUser);
}

/**
 * Retrieve cached branch manager profile from Cookies
 */
export function getManagerProfile(): BranchManagerUser | null {
  const raw = getCookie(BRANCH_MANAGER_USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse manager user session cookie', err);
    }
  }

  return null;
}

/**
 * Log in the branch manager, establishing strictly Cookies session (NO LOCALSTORAGE)
 */
export function loginManagerSession(customUser: BranchManagerUser, token?: string): BranchManagerUser {
  const authToken = token || getCookie('access_token') || getCookie(BRANCH_MANAGER_TOKEN_KEY);

  if (!authToken) {
    throw new Error('Authentication token is required to establish a manager session.');
  }

  const isUUID = (val?: string | null): boolean =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

  const assignmentBranchId = customUser.assignments?.[0]?.branch?.id;
  const validBranchId =
    isUUID(customUser.branchId)
      ? customUser.branchId!
      : isUUID(assignmentBranchId)
      ? assignmentBranchId!
      : (getCookie('tavonza_branch_id') || getCookie('branch_id') || '');

  const user: BranchManagerUser = {
    ...customUser,
    branchId: validBranchId,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Store strictly in Cookies (NO LOCALSTORAGE)
  setCookie(BRANCH_MANAGER_TOKEN_KEY, authToken);
  setCookie('access_token', authToken);
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
