/**
 * Shared Utilities
 * Generic utilities, common formatters, and primitives (strictly server-side, domain-agnostic)
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
 * Currency Formatter
 */
export function formatCurrency(amount: number | string | null | undefined, currency = '$'): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currency}0.00`;
  return `${currency}${numeric.toFixed(2)}`;
}

/**
 * Relative Time Ago Formatter
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
 * UUID Validation Helper
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUUID(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}
