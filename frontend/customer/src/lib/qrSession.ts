import { getCookie, setCookie } from '@/redux/api/baseApi';

export const QR_COOKIE_NAME = 'tavonza_qr_token';

/**
 * Extracts and formats the forwarding query param for QR token or table.
 * If qr is present, returns "?qr=[token]"
 * If table is present, returns "?table=[table]"
 */
export function getQrForwardParam(searchParams?: URLSearchParams | { get: (k: string) => string | null } | null): string {
  if (!searchParams) {
    if (typeof document !== 'undefined') {
      const savedQr = getCookie(QR_COOKIE_NAME);
      if (savedQr) return `?qr=${encodeURIComponent(savedQr)}`;
    }
    return '';
  }

  const qr = searchParams.get('qr') || (typeof document !== 'undefined' ? getCookie(QR_COOKIE_NAME) : null);
  if (qr) return `?qr=${encodeURIComponent(qr)}`;
  const table = searchParams.get('table');
  if (table) return `?table=${encodeURIComponent(table)}`;
  return '';
}

/**
 * Resolves a QR code token to table & branch details via backend API
 */
export async function resolveQrSession(qrToken: string): Promise<{
  tableId: string;
  branchId: string;
  label: string;
  capacity?: number;
} | null> {
  if (!qrToken) return null;
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.tavonza.com';
    const cleanUrl = String(apiBase).trim().replace(/\/$/, '');
    const res = await fetch(`${cleanUrl}/tables/resolve-qr/${encodeURIComponent(qrToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data || json;
    if (data?.id) {
      if (typeof document !== 'undefined') {
        setCookie(QR_COOKIE_NAME, qrToken);
        setCookie('tavonza_table_id', data.id);
        if (data.branchId) setCookie('tavonza_branch_id', data.branchId);
        if (data.label) setCookie('tavonza_table', data.label);
      }
      return {
        tableId: data.id,
        branchId: data.branchId,
        label: data.label,
        capacity: data.capacity,
      };
    }
  } catch (err) {
    console.warn('Could not resolve QR token:', err);
  }
  return null;
}
