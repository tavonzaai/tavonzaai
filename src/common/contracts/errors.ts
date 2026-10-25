/**
 * API error contract shared between `apps/api` and every frontend.
 *
 * Every non-2xx response from the API has the shape of `ApiErrorResponse`.
 * Frontends should branch on `errorCode` (stable, machine-readable) rather than
 * on `message` (human-readable, may change wording).
 */

export const ErrorCode = {
  // ── Generic client errors ────────────────────────────────────────────────
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  RATE_LIMITED: 'RATE_LIMITED',

  // ── Database errors ──────────────────────────────────────────────────────
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  DB_FOREIGN_KEY_VIOLATION: 'DB_FOREIGN_KEY_VIOLATION',
  DB_NOT_NULL_VIOLATION: 'DB_NOT_NULL_VIOLATION',
  DB_CHECK_VIOLATION: 'DB_CHECK_VIOLATION',
  DB_INVALID_INPUT: 'DB_INVALID_INPUT',
  DB_VALUE_TOO_LONG: 'DB_VALUE_TOO_LONG',
  DB_CONCURRENCY_CONFLICT: 'DB_CONCURRENCY_CONFLICT',
  DB_TIMEOUT: 'DB_TIMEOUT',
  DB_UNAVAILABLE: 'DB_UNAVAILABLE',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',

  // ── Server errors ────────────────────────────────────────────────────────
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** A single field-level problem (DTO validation, unique constraint on a column, …). */
export interface ApiFieldError {
  /** Dot-path of the offending field, e.g. `email` or `items.0.quantity`. */
  path: string;
  message: string;
}

/** Body of every non-2xx API response. */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  errorCode: ErrorCode;
  /** Human-readable summary, safe to show to end users. */
  message: string;
  /** Field-level details; empty array when not applicable. */
  errorMessages: ApiFieldError[];
  path: string;
  method: string;
  /** Correlates this response with server logs (also sent as `x-request-id`). */
  requestId: string;
  timestamp: string;
  /** Diagnostic info — only present when the API is NOT running in production. */
  debug?: {
    name?: string;
    detail?: string;
    sqlState?: string;
    constraint?: string;
    table?: string;
    stack?: string;
  };
}
