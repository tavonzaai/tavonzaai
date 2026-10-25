// ============================================================================
// Token Policy — single source of truth for token lifetimes, types & cookies
// ============================================================================
// Every frontend derives its client-side expiry from the `exp` claim of the
// tokens issued here, so there is exactly one place lifetimes are defined.
// ============================================================================

export const ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;
/** Window in which presenting an already-rotated refresh token is treated as a benign multi-tab race. */
export const REFRESH_ROTATION_GRACE_SECONDS = 30;

export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  GUEST: 'guest',
} as const;
export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

export const AUTH_CLIENTS = [
  'admin',
  'superadmin',
  'manager',
  'waiter',
  'kitchen',
  'cashier',
  'customer',
] as const;
export type AuthClient = (typeof AUTH_CLIENTS)[number];

export function isAuthClient(value: unknown): value is AuthClient {
  return typeof value === 'string' && (AUTH_CLIENTS as readonly string[]).includes(value);
}

export const API_CLIENT = 'api';

export function refreshCookieName(client: AuthClient): string {
  return `tvz_rt_${client}`;
}

export const REFRESH_COOKIE_PATH = '/auth';

export function refreshCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  };
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      const value = part.slice(index + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

const DEV_ACCESS_SECRET = 'dev-secret-change-in-prod';

function isProductionEnv(): boolean {
  const env = (process.env.APP_ENV || process.env.NODE_ENV || '').toLowerCase();
  return env === 'production' || env === 'prod' || env === 'live';
}

export function accessTokenSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (isProductionEnv()) {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return DEV_ACCESS_SECRET;
}

export function refreshTokenSecret(): string {
  return process.env.JWT_REFRESH_SECRET || accessTokenSecret();
}

// ── Refresh token evaluation ────────────────────────────────────────────────

export interface RefreshRecordState {
  tokenHash: string;
  expiresAt: Date;
  rotatedAt: Date | null;
}

export interface RefreshSessionState {
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export type RefreshDecision =
  | { outcome: 'rotate' }
  | { outcome: 'reject'; reason: 'unknown' | 'mismatch' | 'expired' | 'revoked' | 'race' }
  | { outcome: 'reuse' };

/**
 * Decides what to do with a presented refresh token.
 * - `rotate`: valid and unused; issue a new pair and retire this one.
 * - `reuse`: an already-rotated token was replayed outside the grace window,
 *   which indicates theft — the whole session must be revoked.
 * - `reject` with `race`: replayed within the grace window (concurrent tabs);
 *   refuse without revoking.
 */
export function evaluateRefreshToken(input: {
  record: RefreshRecordState | null;
  session: RefreshSessionState | null;
  subject: string;
  presentedHash: string;
  now: Date;
}): RefreshDecision {
  const { record, session, subject, presentedHash, now } = input;
  if (!record || !session || session.userId !== subject) {
    return { outcome: 'reject', reason: 'unknown' };
  }
  if (record.tokenHash !== presentedHash) {
    return { outcome: 'reject', reason: 'mismatch' };
  }
  if (session.revokedAt) {
    return { outcome: 'reject', reason: 'revoked' };
  }
  if (record.expiresAt <= now || session.expiresAt <= now) {
    return { outcome: 'reject', reason: 'expired' };
  }
  if (record.rotatedAt) {
    const elapsedSeconds = (now.getTime() - record.rotatedAt.getTime()) / 1000;
    if (elapsedSeconds <= REFRESH_ROTATION_GRACE_SECONDS) {
      return { outcome: 'reject', reason: 'race' };
    }
    return { outcome: 'reuse' };
  }
  return { outcome: 'rotate' };
}

export function isSessionUsable(
  session: { userId: string; revokedAt: Date | null; expiresAt: Date } | null,
  userId: string,
  now: Date,
): boolean {
  return Boolean(session && session.userId === userId && !session.revokedAt && session.expiresAt > now);
}
