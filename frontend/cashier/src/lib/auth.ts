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
  const accessToken = getCookie('access_token');
  const sessionToken = getCookie('customer_session');

  return !!(cashierToken || accessToken || sessionToken);
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
 * Log in the cashier, establishing strictly Cookies session (NO LOCALSTORAGE)
 */
export function loginCashierSession(customUser?: Partial<CashierUser>): CashierUser {
  const existingToken = getCookie(CASHIER_TOKEN_KEY) || getCookie('access_token');
  const token = (existingToken && !existingToken.startsWith('csh_tok_'))
    ? existingToken
    : `csh_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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

  // Store strictly in Cookies (NO LOCALSTORAGE)
  setCookie(CASHIER_TOKEN_KEY, token);
  setCookie('access_token', token);
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
