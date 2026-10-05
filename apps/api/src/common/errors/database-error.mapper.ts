import { HttpStatus } from '@nestjs/common';
import { ErrorCode, type ApiFieldError } from '@tavonza/contracts';

/**
 * Normalised representation of a database failure, ready to be turned into
 * an HTTP response by the global exception filter.
 */
export interface MappedDatabaseError {
  status: HttpStatus;
  errorCode: ErrorCode;
  /** Safe, user-facing message. Never contains raw SQL or row values. */
  message: string;
  errorMessages: ApiFieldError[];
  /** Raw diagnostics — logged, and exposed as `debug` only outside production. */
  diagnostics: {
    sqlState?: string;
    constraint?: string;
    table?: string;
    column?: string;
    detail?: string;
    rawMessage?: string;
  };
}

/** Subset of `pg`'s `DatabaseError` we rely on (avoids a hard dependency on `pg` types). */
interface PgLikeError {
  code?: string;
  message?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  severity?: string;
  routine?: string;
  cause?: unknown;
}

// ── Constraint-specific messages ────────────────────────────────────────────
// Drizzle names `.unique()` columns `<table>_<column>_unique`.
// Add entries here whenever a constraint deserves a more specific message.
const CONSTRAINT_MESSAGES: Record<string, { message: string; field?: string }> = {
  users_email_unique: { message: 'An account with this email already exists.', field: 'email' },
  users_contact_no_unique: { message: 'This phone number is already in use.', field: 'phone' },
  staff_branch_unique: { message: 'This staff member is already assigned to this branch.' },
  work_shifts_staff_shift_unique: {
    message: 'This staff member already has a shift at that date and time.',
  },
  orders_order_number_unique: { message: 'An order with this number already exists.', field: 'orderNumber' },
  tables_qr_code_token_unique: { message: 'This QR code is already linked to another table.', field: 'qrCodeToken' },
};

/** Node / pg driver error codes that mean "we can't reach the database". */
const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'EPIPE',
  'EAI_AGAIN',
]);

const CONNECTION_ERROR_MESSAGES = [
  'connection terminated',
  'timeout exceeded when trying to connect',
  'connection timeout',
  'cannot use a pool after calling end',
  'client has encountered a connection error',
];

const SQLSTATE_RE = /^[0-9A-Z]{5}$/;

function isPgDatabaseError(value: unknown): value is PgLikeError {
  if (!value || typeof value !== 'object') return false;
  const v = value as PgLikeError;
  return typeof v.code === 'string' && SQLSTATE_RE.test(v.code) && ('severity' in v || 'routine' in v);
}

function isConnectionError(value: unknown): value is PgLikeError {
  if (!value || typeof value !== 'object') return false;
  const v = value as PgLikeError;
  if (typeof v.code === 'string' && CONNECTION_ERROR_CODES.has(v.code)) return true;
  const msg = (v.message ?? '').toLowerCase();
  return CONNECTION_ERROR_MESSAGES.some((needle) => msg.includes(needle));
}

/**
 * Walk the `cause` chain (Drizzle ≥0.44 wraps pg errors in `DrizzleQueryError`,
 * NestJS/other wrappers may nest further) and return the first database error.
 */
function findDatabaseError(err: unknown): { kind: 'sql' | 'connection'; error: PgLikeError } | null {
  let current: unknown = err;
  for (let depth = 0; depth < 6 && current; depth++) {
    if (isPgDatabaseError(current)) return { kind: 'sql', error: current };
    if (isConnectionError(current)) return { kind: 'connection', error: current };
    current = (current as PgLikeError).cause;
  }
  return null;
}

// ── Helpers for parsing Postgres `detail` strings ──────────────────────────

/** `Key (email)=(a@b.com) already exists.` → `['email']`; composite keys → several columns. */
function parseKeyColumns(detail?: string): string[] {
  const match = detail?.match(/Key \(([^)]+)\)=/);
  if (!match?.[1]) return [];
  return match[1].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
}

/** `… is not present in table "menu_items".` / `… referenced from table "orders".` */
function parseReferencedTable(detail?: string): string | undefined {
  return detail?.match(/table "([^"]+)"/)?.[1];
}

const snakeToCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const humanize = (s: string) =>
  s
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();

const singular = (table: string) => humanize(table).replace(/ies$/, 'y').replace(/s$/, '');

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Translate a PostgreSQL / node-postgres error into an HTTP-friendly shape.
 * Returns `null` if `err` is not a database error.
 */
export function mapDatabaseError(err: unknown): MappedDatabaseError | null {
  const found = findDatabaseError(err);
  if (!found) return null;

  const e = found.error;
  const diagnostics: MappedDatabaseError['diagnostics'] = {
    sqlState: e.code,
    constraint: e.constraint,
    table: e.table,
    column: e.column,
    detail: e.detail,
    rawMessage: e.message,
  };

  const result = (
    status: HttpStatus,
    errorCode: ErrorCode,
    message: string,
    errorMessages: ApiFieldError[] = [],
  ): MappedDatabaseError => ({ status, errorCode, message, errorMessages, diagnostics });

  if (found.kind === 'connection') {
    return result(
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.DB_UNAVAILABLE,
      'The service is temporarily unavailable. Please try again shortly.',
    );
  }

  const code = e.code!;
  const known = e.constraint ? CONSTRAINT_MESSAGES[e.constraint] : undefined;

  switch (code) {
    // ── 23505 unique_violation ────────────────────────────────────────────
    case '23505': {
      const columns = parseKeyColumns(e.detail);
      const field = known?.field ?? (columns.length === 1 ? snakeToCamel(columns[0]!) : undefined);
      const label = columns.length ? columns.map(humanize).join(' and ') : 'value';
      const message = known?.message ?? `A record with this ${label} already exists.`;
      return result(
        HttpStatus.CONFLICT,
        ErrorCode.DB_UNIQUE_VIOLATION,
        message,
        field ? [{ path: field, message: known?.message ?? `This ${label} is already in use.` }] : [],
      );
    }

    // ── 23503 foreign_key_violation ───────────────────────────────────────
    case '23503': {
      const columns = parseKeyColumns(e.detail);
      const refTable = parseReferencedTable(e.detail);
      const stillReferenced = /still referenced/i.test(e.detail ?? '');
      if (stillReferenced) {
        const by = refTable ? ` by existing ${humanize(refTable)}` : '';
        return result(
          HttpStatus.CONFLICT,
          ErrorCode.DB_FOREIGN_KEY_VIOLATION,
          `This record cannot be deleted or changed because it is still used${by}.`,
        );
      }
      const col = columns[0];
      const target = refTable ? singular(refTable) : col ? humanize(col) : 'related record';
      return result(
        HttpStatus.BAD_REQUEST,
        ErrorCode.DB_FOREIGN_KEY_VIOLATION,
        `The referenced ${target} does not exist.`,
        col ? [{ path: snakeToCamel(col), message: `The referenced ${target} does not exist.` }] : [],
      );
    }

    // ── 23502 not_null_violation ──────────────────────────────────────────
    case '23502': {
      const col = e.column ?? e.message?.match(/column "([^"]+)"/)?.[1];
      const label = col ? humanize(col) : 'A required field';
      const message = col ? `The ${label} field is required.` : 'A required field is missing.';
      return result(
        HttpStatus.BAD_REQUEST,
        ErrorCode.DB_NOT_NULL_VIOLATION,
        message,
        col ? [{ path: snakeToCamel(col), message }] : [],
      );
    }

    // ── 23514 check_violation / 23P01 exclusion_violation ─────────────────
    case '23514':
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_CHECK_VIOLATION, 'One or more values are outside the allowed range.');
    case '23P01':
      return result(HttpStatus.CONFLICT, ErrorCode.DB_UNIQUE_VIOLATION, 'This conflicts with an existing record.');

    // ── 22xxx data exceptions ─────────────────────────────────────────────
    case '22P02': {
      // invalid_text_representation — bad uuid / enum / number literal
      const type = e.message?.match(/for (?:type|enum) ([\w.]+)/)?.[1];
      const message =
        type === 'uuid'
          ? 'One of the provided identifiers is not a valid ID.'
          : type
            ? `A provided value is not valid for ${humanize(type)}.`
            : 'One of the provided values has an invalid format.';
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_INVALID_INPUT, message);
    }
    case '22001':
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_VALUE_TOO_LONG, 'One of the provided values is too long.');
    case '22003':
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_INVALID_INPUT, 'A numeric value is out of range.');
    case '22007':
    case '22008':
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_INVALID_INPUT, 'A date or time value is invalid.');
    case '22012':
      return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_INVALID_INPUT, 'Division by zero in the requested calculation.');

    // ── Concurrency ───────────────────────────────────────────────────────
    case '40001':
    case '40P01':
      return result(
        HttpStatus.CONFLICT,
        ErrorCode.DB_CONCURRENCY_CONFLICT,
        'The record was modified by another request. Please retry.',
      );
    case '55P03': // lock_not_available
      return result(HttpStatus.CONFLICT, ErrorCode.DB_CONCURRENCY_CONFLICT, 'The record is currently locked. Please retry.');

    // ── Timeouts / availability ───────────────────────────────────────────
    case '57014':
      return result(HttpStatus.GATEWAY_TIMEOUT, ErrorCode.DB_TIMEOUT, 'The request took too long to process. Please try again.');
    case '53300': // too_many_connections
    case '57P01': // admin_shutdown
    case '57P02': // crash_shutdown
    case '57P03': // cannot_connect_now
      return result(
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.DB_UNAVAILABLE,
        'The service is temporarily unavailable. Please try again shortly.',
      );
  }

  // ── Class-based fallbacks ───────────────────────────────────────────────
  if (code.startsWith('08') || code.startsWith('53')) {
    return result(
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.DB_UNAVAILABLE,
      'The service is temporarily unavailable. Please try again shortly.',
    );
  }
  if (code.startsWith('22')) {
    return result(HttpStatus.BAD_REQUEST, ErrorCode.DB_INVALID_INPUT, 'One of the provided values is invalid.');
  }
  if (code.startsWith('23')) {
    return result(HttpStatus.CONFLICT, ErrorCode.CONFLICT, 'The request conflicts with existing data.');
  }

  // 42xxx (syntax / undefined column), XX000 (internal), etc. → our bug, not the user's.
  return result(
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.DB_QUERY_ERROR,
    'An unexpected error occurred. Please try again later.',
  );
}
