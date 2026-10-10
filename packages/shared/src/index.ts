/**
 * @tavonza/shared
 * Generic utilities, common errors, and primitives (strictly domain-agnostic)
 */

export interface QuerySerializerOptions {
  page?: number | string | null;
  limit?: number | string | null;
  search?: string | null;
  searchTerm?: string | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC' | null;
  includeDeleted?: boolean;
  [key: string]: any;
}

/**
 * Builds a standardized URL query string matching Tavonza backend DrizzleQueryBuilder.
 * Ignores undefined, null, or empty string values.
 */
export function buildQueryString(options?: QuerySerializerOptions | null): string {
  if (!options) return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null || value === '') continue;

    // Handle nested range or filter objects if passed
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [subKey, subVal] of Object.entries(value)) {
        if (subVal !== undefined && subVal !== null && subVal !== '') {
          params.append(`${key}[${subKey}]`, String(subVal));
        }
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          params.append(`${key}[]`, String(item));
        }
      }
      continue;
    }

    params.append(key, String(value));
  }

  const queryStr = params.toString();
  return queryStr ? `?${queryStr}` : '';
}

/**
 * 🍪 Universal Browser Cookie Helpers
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * 🌐 Standard API Base URL Resolution
 * Automatically resolves localhost:3000 in local development and production URL otherwise.
 */
export function resolveApiBaseUrl(): string {
  // 1. Explicit env variables
  const envUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    (typeof process !== 'undefined' && process.env?.API_BASE_URL);

  if (envUrl) {
    return String(envUrl).trim().replace(/\/docs(-json)?\/?$/, '').replace(/\/$/, '');
  }

  // 2. Client-side browser inspection
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }

  // 3. Production Default
  return 'https://api.tavonza.com';
}

/**
 * 💲 Currency Formatter
 */
export function formatCurrency(amount: number | string | null | undefined, currency = '$'): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currency}0.00`;
  return `${currency}${numeric.toFixed(2)}`;
}

/**
 * 🕒 Relative Time Ago Formatter
 */
export function formatTimeAgo(timestamp: string | number | Date | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recently';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * 🆔 UUID Validation Helper
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUUID(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}
