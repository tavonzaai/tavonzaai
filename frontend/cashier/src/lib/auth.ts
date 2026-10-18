'use client';

import { getCookie, setCookie, removeCookie } from '@/redux/api/baseApi';

export const CASHIER_TOKEN_KEY = 'cashier_token';
export const CASHIER_USER_KEY = 'cashier_user';

export interface CashierUser {
  id: string;
  name: string;
  email: string;
  role: string;
  station: string;
  shiftStartedAt?: string;
  assignments?: Array<{
    id?: string;
    role: string;
    branch?: { id: string; name: string };
  }>;
}

export function isCashierAuthenticated(): boolean {
  if (typeof document === 'undefined') return false;
  const cashierToken = getCookie(CASHIER_TOKEN_KEY);
  if (!cashierToken || !cashierToken.trim()) return false;
  if (cashierToken.startsWith('csh_tok_')) return false;
  return true;
}

/**
 * Retrieve cached cashier profile from Cookies
 */
export function getCashierProfile(): CashierUser | null {
  const raw = getCookie(CASHIER_USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse cashier user session cookie', err);
    }
  }
  return null;
}

/**
 * Cache cashier profile after a successful /auth/login.
 * Requires a real access JWT already stored in cashier_token.
 */
export function loginCashierSession(customUser?: Partial<CashierUser>): CashierUser {
  const existingToken = getCookie(CASHIER_TOKEN_KEY);
  if (!existingToken || existingToken.startsWith('csh_tok_')) {
    throw new Error('Cashier login requires a valid API access token. Sign in through /auth/login.');
  }

  const user: CashierUser = {
    id: customUser?.id || '',
    name: customUser?.name || 'Cashier User',
    email: customUser?.email || '',
    role: customUser?.role || 'CASHIER',
    station: customUser?.station || 'Main Cashier Terminal',
    assignments: customUser?.assignments || [],
    shiftStartedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...customUser,
  };

  setCookie(CASHIER_USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Terminate the cashier shift session, purging all Cookies (NO LOCALSTORAGE)
 */
export function logoutCashierSession(): void {
  removeCookie(CASHIER_TOKEN_KEY);
  removeCookie('access_token');
  removeCookie('refresh_token');
  removeCookie('customer_session');
  removeCookie(CASHIER_USER_KEY);
}
