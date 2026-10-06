'use client';

import { getCookie, setCookie, removeCookie } from '@/redux/api/baseApi';

export const KITCHEN_TOKEN_KEY = 'kitchen_token';
export const KITCHEN_USER_KEY = 'kitchen_user';

export interface KitchenUser {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  shiftStartedAt?: string;
  assignments?: Array<{
    id: string;
    role: string;
    branch?: { id: string; name: string };
  }>;
}

export const DEMO_KITCHEN_USER: KitchenUser = {
  id: 'ktc-101',
  name: 'Chef Marco',
  email: ' ',
  role: 'KITCHEN',
  station: 'Main Kitchen Display (KDS)',
  assignments: [
    {
      id: 'asg-ktc-1',
      role: 'KITCHEN',
      branch: { id: 'br-1', name: 'Main Kitchen Station' },
    },
  ],
};

/**
 * Check if kitchen session is currently active (STRICTLY COOKIES ONLY - NO LOCALSTORAGE)
 * Must only check kitchen_token to avoid interference from other app sessions.
 */
export function isKitchenAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const kitchenToken = getCookie(KITCHEN_TOKEN_KEY);
  return Boolean(kitchenToken && kitchenToken.trim().length > 0);
}

/**
 * Retrieve cached kitchen profile from Cookies
 */
export function getStoredKitchenUser(): KitchenUser | null {
  if (typeof document === 'undefined') return null;
  const raw = getCookie(KITCHEN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse kitchen user session cookie', err);
    return null;
  }
}

export function getKitchenProfile(): KitchenUser | null {
  return getStoredKitchenUser();
}

/**
 * Log in the chef/kitchen staff, establishing strictly Cookies session (NO LOCALSTORAGE)
 */
export function loginKitchenSession(customUser?: Partial<KitchenUser>): KitchenUser {
  const existingToken = getCookie(KITCHEN_TOKEN_KEY);
  // Keep existing JWT access token if set by rawAuthApi.login, otherwise generate demo token
  const token = (existingToken && !existingToken.startsWith('ktc_tok_'))
    ? existingToken
    : `ktc_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const user: KitchenUser = {
    ...DEMO_KITCHEN_USER,
    ...customUser,
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Store strictly in Cookies (NO LOCALSTORAGE)
  setCookie(KITCHEN_TOKEN_KEY, token);
  setCookie(KITCHEN_USER_KEY, JSON.stringify(user));

  return user;
}

/**
 * Terminate the kitchen station shift session, purging all kitchen Cookies (NO LOCALSTORAGE)
 */
export function logoutKitchenSession(): void {
  removeCookie(KITCHEN_TOKEN_KEY);
  removeCookie(KITCHEN_USER_KEY);
  removeCookie('kitchen_refresh_token');
}

// Aliases for compatibility
export const isCashierAuthenticated = isKitchenAuthenticated;
export const loginCashierSession = loginKitchenSession;
export const logoutCashierSession = logoutKitchenSession;
