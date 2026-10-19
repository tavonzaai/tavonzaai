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

export function isKitchenAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const kitchenToken = getCookie(KITCHEN_TOKEN_KEY);
  if (!kitchenToken || !kitchenToken.trim()) return false;
  // Reject legacy synthetic tokens — only real API JWTs are accepted.
  if (kitchenToken.startsWith('ktc_tok_')) return false;
  return true;
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
 * Cache kitchen profile after a successful /auth/login.
 * Requires a real access JWT already stored in kitchen_token.
 */
export function loginKitchenSession(customUser?: Partial<KitchenUser>): KitchenUser {
  const existingToken = getCookie(KITCHEN_TOKEN_KEY);
  if (!existingToken || existingToken.startsWith('ktc_tok_')) {
    throw new Error('Kitchen login requires a valid API access token. Sign in through /auth/login.');
  }

  const user: KitchenUser = {
    id: customUser?.id || '',
    name: customUser?.name || 'Kitchen Staff',
    email: customUser?.email || '',
    role: customUser?.role || 'KITCHEN',
    station: customUser?.station || 'Main Kitchen Station',
    assignments: customUser?.assignments || [],
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...customUser,
  };

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
