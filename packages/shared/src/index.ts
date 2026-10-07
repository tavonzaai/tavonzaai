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
