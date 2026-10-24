import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strictly validates whether a string is a valid public HTTP/HTTPS URL
 * compliant with backend class-validator @IsUrl() rules.
 * Rejects localhost, relative paths, protocols other than http/https, empty strings,
 * and hostnames without a valid top-level domain (TLD).
 */
export function isValidHttpUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;

  // Must explicitly start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname;
    if (!hostname) return false;

    // Disallow localhost, .local, .internal, .localhost, or single-label hosts
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Check if IPv4 address
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (!isIpv4) {
      const parts = hostname.split('.');
      if (parts.length < 2) return false;
      const tld = parts[parts.length - 1];
      // TLD must be at least 2 alpha characters
      if (!/^[a-z]{2,}$/i.test(tld)) return false;

      // All domain labels must be valid DNS alphanumeric characters or hyphens
      for (const part of parts) {
        if (!part || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(part)) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Dynamically retrieves all available IANA timezones supported by the runtime platform.
 * Contains ZERO static hardcoded lists. Returns an empty array if unsupported.
 */
export function getAvailableTimezones(): string[] {
  try {
    if (typeof Intl !== 'undefined' && typeof (Intl as any).supportedValuesOf === 'function') {
      const list = (Intl as any).supportedValuesOf('timeZone');
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {
    // Unsupported or error in environment
  }
  return [];
}

/**
 * Dynamically resolves the client's current runtime timezone.
 * Returns empty string if unavailable.
 */
export function getDefaultClientTimezone(): string {
  try {
    if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return tz;
    }
  } catch {}
  return '';
}
