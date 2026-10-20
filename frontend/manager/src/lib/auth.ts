'use client';

import { getAuthToken, removeAuthToken, setAuthTokens } from '../redux/api/baseApi';

export const BRANCH_MANAGER_TOKEN_KEY = 'access_token';
/** @deprecated Legacy cookie — cleared on login/logout; do not write. */
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
    branchId?: string;
  }>;
}

/** In-memory active branch for this tab — never persisted to cookies. */
let activeBranchIdMemory: string | null = null;

export function setActiveBranchIdMemory(branchId: string | null | undefined): void {
  if (branchId && isUuid(branchId)) {
    activeBranchIdMemory = branchId;
  }
}

export function getActiveBranchIdMemory(): string | null {
  return activeBranchIdMemory;
}

function isUuid(val?: string | null): boolean {
  return Boolean(
    val &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val),
  );
}

/** Decode branchId from the access-token JWT payload (no cookie profile). */
export function getBranchIdFromAccessToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { branchId?: string | null };
    return isUuid(payload.branchId) ? String(payload.branchId) : null;
  } catch {
    return null;
  }
}

export function resolveBranchIdFromUser(user?: BranchManagerUser | null): string | null {
  if (!user) return null;
  if (isUuid(user.branchId)) return String(user.branchId);
  const fromAssignment =
    user.assignments?.find((a) => isUuid(a.branch?.id) || isUuid(a.branchId)) || null;
  if (fromAssignment) {
    const id = fromAssignment.branch?.id || fromAssignment.branchId;
    if (isUuid(id)) return String(id);
  }
  return null;
}

export function isRoleAllowedForManager(
  user?: { role?: string; assignments?: Array<{ role: string; branchId?: string; branch?: any }> } | null,
): boolean {
  if (!user) return false;
  const role = String(user.role || '').toUpperCase();
  const allowed = [
    'SUPER_ADMIN',
    'ORG_ADMIN',
    'RESTAURANT_OWNER',
    'BRANCH_MANAGER',
    'MANAGER',
    'GENERAL_MANAGER',
    'ADMIN',
  ];
  if (allowed.includes(role)) return true;
  if (Array.isArray(user.assignments)) {
    return user.assignments.some((a) => allowed.includes(String(a.role || '').toUpperCase()));
  }
  return false;
}

export function isManagerAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
}

/**
 * Profile must come from Redux / GET /users/me — never from cookies.
 */
export function getManagerProfile(): BranchManagerUser | null {
  return null;
}

/**
 * Persist only the access token. User/branch live in Redux + API.
 */
export function loginManagerSession(
  customUser: BranchManagerUser,
  token?: string,
): BranchManagerUser {
  const authToken = token || getAuthToken();

  if (!authToken) {
    throw new Error('Authentication token is required to establish a manager session.');
  }

  setAuthTokens({ accessToken: authToken });

  const branchId =
    resolveBranchIdFromUser(customUser) || getBranchIdFromAccessToken() || undefined;
  setActiveBranchIdMemory(branchId);

  return {
    ...customUser,
    branchId,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Logout: remove access token (and legacy auth cookies). No profile cookies remain.
 */
export function logoutManagerSession(): void {
  removeAuthToken();
  activeBranchIdMemory = null;
}
