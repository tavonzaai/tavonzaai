/**
 * @tavonza/observability — Core Types (Fully Generic & Domain-Agnostic)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Generic HTTP request abstraction compatible with Express, Fastify, and Node http.IncomingMessage.
 */
export interface HttpRequestLike {
  headers: Record<string, any>;
  rawHeaders?: string[];
  method?: string;
  url?: string;
  originalUrl?: string;
  ip?: string;
  socket?: { remoteAddress?: string };
  body?: unknown;
  rawBody?: Buffer | string;
  query?: Record<string, unknown>;
  httpVersion?: string;
  user?: unknown;
}

/**
 * Generic HTTP response abstraction compatible with Express, Fastify, and Node http.ServerResponse.
 */
export interface HttpResponseLike {
  statusCode?: number;
  getHeader?: (name: string) => number | string | string[] | undefined;
  getHeaders?: () => Record<string, number | string | string[] | undefined>;
  setHeader?: (name: string, value: number | string | readonly string[]) => void;
  headersSent?: boolean;
}

/**
 * Options to fully customize HTTP telemetry extraction in consuming applications.
 */
export interface HttpTraceOptions<TUser = unknown> {
  /**
   * Optional custom function to extract and format user/actor context from the request.
   */
  extractUser?: (req: HttpRequestLike) => TUser | undefined;

  /**
   * Optional callback to extract arbitrary custom metadata (e.g. tenant, session, traceparent).
   */
  extractCustomMeta?: (req: HttpRequestLike, res?: HttpResponseLike) => Record<string, unknown> | undefined;

  /**
   * Optional custom request ID resolver.
   */
  extractRequestId?: (req: HttpRequestLike) => string | undefined;

  /**
   * Additional sensitive keys to redact from body/query logging.
   */
  sensitiveKeys?: string[];

  /**
   * Optional formatter for the user identity label in console summaries.
   */
  formatUserLabel?: (user: TUser) => string | undefined;
}

/**
 * Complete HTTP trace metadata payload for structured logging.
 * Fully generic — accepts any user type TUser.
 */
export interface HttpTraceContext<TUser = unknown> {
  requestId: string;
  clientIp: string;
  country?: string;
  method: string;
  path: string;
  httpVersion?: string;
  statusCode?: number;
  duration?: string;
  durationMs?: number;
  requestHeaderBytes: number;
  requestHeaderSize: string;
  requestPayloadBytes: number;
  requestPayloadSize: string;
  requestHeadersCount: number;
  requestContentType?: string;
  responseHeaderBytes?: number;
  responseHeaderSize?: string;
  responsePayloadBytes?: number;
  responsePayloadSize?: string;
  responseContentType?: string;
  userAgent?: string;
  referrer?: string;
  user?: TUser;
  query?: unknown;
  body?: unknown;
  [key: string]: unknown;
}
