/**
 * @tavonza/observability — HTTP Request & Response Telemetry Extraction (Generic)
 */

import { randomUUID } from 'crypto';
import type {
  HttpRequestLike,
  HttpResponseLike,
  HttpTraceContext,
  HttpTraceOptions,
} from './types.js';
import { formatBytes, formatDuration } from './formatters.js';
import { sanitizeData } from './sanitizer.js';

/**
 * Normalizes an IP address (e.g. strips IPv4-mapped IPv6 prefix `::ffff:`).
 */
export function cleanIp(ip: string): string {
  if (!ip) return 'unknown';
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip.trim();
}

/**
 * Extracts real client IP address, handling Cloudflare, Nginx, ALBs, and multi-proxy chains.
 */
export function getClientIp(req: HttpRequestLike): string {
  // 1. Cloudflare connecting IP
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cleanIp(cfIp);
  }

  // 2. Standard X-Forwarded-For header (first entry is the client)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
    const ips = xForwardedFor.split(',');
    const client = ips[0]?.trim();
    if (client) return cleanIp(client);
  } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    const client = xForwardedFor[0]?.trim();
    if (client) return cleanIp(client);
  }

  // 3. Nginx / Reverse Proxy Real IP
  const xRealIp = req.headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.trim()) {
    return cleanIp(xRealIp);
  }

  // 4. Express resolved req.ip (works when 'trust proxy' is enabled)
  if (req.ip) {
    return cleanIp(req.ip);
  }

  // 5. Socket remote address fallback
  if (req.socket?.remoteAddress) {
    return cleanIp(req.socket.remoteAddress);
  }

  return 'unknown';
}

/**
 * Calculates total request header byte size using wire format (Key: Value\r\n).
 */
export function getRequestHeaderSize(req: HttpRequestLike): number {
  if (req.rawHeaders && Array.isArray(req.rawHeaders)) {
    return req.rawHeaders.reduce((acc, str, index) => {
      return acc + Buffer.byteLength(str) + (index % 2 === 1 ? 4 : 0);
    }, 0);
  }

  if (req.headers) {
    let size = 0;
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        const valStr = Array.isArray(val) ? val.join(', ') : String(val);
        size += Buffer.byteLength(key) + Buffer.byteLength(valStr) + 4;
      }
    }
    return size;
  }

  return 0;
}

/**
 * Calculates request body / payload size in bytes.
 */
export function getRequestPayloadSize(req: HttpRequestLike): number {
  // 1. Content-Length header
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    const rawStr = Array.isArray(contentLength) ? contentLength[0] : contentLength;
    if (rawStr) {
      const parsed = parseInt(rawStr, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  }

  // 2. Raw body if available
  if (req.rawBody) {
    if (Buffer.isBuffer(req.rawBody)) return req.rawBody.length;
    if (typeof req.rawBody === 'string') return Buffer.byteLength(req.rawBody);
  }

  // 3. Parsed JSON body
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    try {
      return Buffer.byteLength(JSON.stringify(req.body));
    } catch {
      return 0;
    }
  }

  return 0;
}

/**
 * Calculates total response header byte size.
 */
export function getResponseHeaderSize(res?: HttpResponseLike): number {
  if (!res || typeof res.getHeaders !== 'function') return 0;
  const headers = res.getHeaders();
  let size = 0;
  for (const [key, val] of Object.entries(headers)) {
    if (val !== undefined) {
      const valStr = Array.isArray(val) ? val.join(', ') : String(val);
      size += Buffer.byteLength(key) + Buffer.byteLength(valStr) + 4;
    }
  }
  return size;
}

/**
 * Extracts complete HTTP telemetry metadata for structured logging.
 * Fully generic — accepts custom HttpTraceOptions for developer freedom.
 */
export function extractHttpRequestMeta<TUser = unknown>(
  req: HttpRequestLike,
  res?: HttpResponseLike,
  durationMsOrOptions?: number | HttpTraceOptions<TUser>,
  overrideResPayloadBytes?: number,
  options?: HttpTraceOptions<TUser>,
): HttpTraceContext<TUser> {
  let resolvedDurationMs: number | undefined;
  let resolvedOptions: HttpTraceOptions<TUser> | undefined = options;

  if (typeof durationMsOrOptions === 'number') {
    resolvedDurationMs = durationMsOrOptions;
  } else if (durationMsOrOptions && typeof durationMsOrOptions === 'object') {
    resolvedOptions = durationMsOrOptions;
  }

  // 1. Request / Correlation ID
  const customId = resolvedOptions?.extractRequestId?.(req);
  const existingReqId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId: string =
    customId ||
    (typeof existingReqId === 'string' ? existingReqId : undefined) ||
    (Array.isArray(existingReqId) ? existingReqId[0] : undefined) ||
    randomUUID();

  // Propagate correlation ID to request and response headers
  req.headers['x-request-id'] = requestId;
  if (res && typeof res.setHeader === 'function' && !res.headersSent) {
    res.setHeader('x-request-id', requestId);
  }

  // 2. Client & Route
  const clientIp = getClientIp(req);
  const countryHeader = req.headers['cf-ipcountry'] || req.headers['x-country'];
  const country =
    typeof countryHeader === 'string'
      ? countryHeader
      : Array.isArray(countryHeader)
        ? countryHeader[0]
        : undefined;

  const method = req.method || 'GET';
  const path = req.originalUrl || req.url || '/';
  const httpVersion = req.httpVersion;
  const userAgent = (Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'][0] : req.headers['user-agent']) ?? '';
  const referrer = (Array.isArray(req.headers['referer']) ? req.headers['referer'][0] : req.headers['referer']) ||
    (Array.isArray(req.headers['origin']) ? req.headers['origin'][0] : req.headers['origin']);
  const requestContentType = Array.isArray(req.headers['content-type']) ? req.headers['content-type'][0] : req.headers['content-type'];

  // 3. Sizes
  const reqHeaderBytes = getRequestHeaderSize(req);
  const reqPayloadBytes = getRequestPayloadSize(req);
  const reqHeadersCount = Object.keys(req.headers || {}).length;

  let resPayloadBytes = overrideResPayloadBytes ?? 0;
  if (res && resPayloadBytes === 0 && typeof res.getHeader === 'function') {
    const cl = res.getHeader('content-length');
    if (cl) {
      const parsed = parseInt(String(cl), 10);
      if (!isNaN(parsed) && parsed > 0) resPayloadBytes = parsed;
    }
  }

  const resHeaderBytes = getResponseHeaderSize(res);
  const responseContentType = res && typeof res.getHeader === 'function' ? (res.getHeader('content-type') as string) : undefined;

  // 4. Developer-Controlled User / Actor Context (No hardcoded domain fields)
  let user: TUser | undefined;
  if (resolvedOptions?.extractUser) {
    user = resolvedOptions.extractUser(req);
  } else if (req.user !== undefined && req.user !== null) {
    user = (typeof req.user === 'object'
      ? sanitizeData(req.user, resolvedOptions?.sensitiveKeys)
      : req.user) as TUser;
  }

  // 5. Developer-Controlled Custom Metadata (e.g. tenant, session, station, traceparent)
  const customMeta = resolvedOptions?.extractCustomMeta?.(req, res);

  return {
    requestId,
    clientIp,
    country,
    method,
    path,
    httpVersion,
    statusCode: res?.statusCode,
    duration: resolvedDurationMs !== undefined ? formatDuration(resolvedDurationMs) : undefined,
    durationMs: resolvedDurationMs,
    requestHeaderBytes: reqHeaderBytes,
    requestHeaderSize: formatBytes(reqHeaderBytes),
    requestPayloadBytes: reqPayloadBytes,
    requestPayloadSize: formatBytes(reqPayloadBytes),
    requestHeadersCount: reqHeadersCount,
    requestContentType,
    responseHeaderBytes: resHeaderBytes,
    responseHeaderSize: formatBytes(resHeaderBytes),
    responsePayloadBytes: resPayloadBytes,
    responsePayloadSize: formatBytes(resPayloadBytes),
    responseContentType,
    userAgent,
    referrer,
    user,
    query: req.query && Object.keys(req.query).length > 0 ? sanitizeData(req.query, resolvedOptions?.sensitiveKeys) : undefined,
    body: sanitizeData(req.body, resolvedOptions?.sensitiveKeys),
    ...(customMeta || {}),
  };
}

/**
 * Formats a clean single-line summary string for human-readable console logging.
 * Fully customizable via optional formatUserLabel callback.
 */
export function formatHttpTraceSummary<TUser = unknown>(
  meta: HttpTraceContext<TUser>,
  formatUserLabel?: (user: TUser) => string | undefined,
): string {
  const statusStr = meta.statusCode ? ` ${meta.statusCode}` : '';
  const durationStr = meta.duration ? ` (${meta.duration})` : '';
  const countryStr = meta.country ? ` [${meta.country}]` : '';
  const totalReq = meta.requestHeaderBytes + meta.requestPayloadBytes;
  const totalRes = (meta.responseHeaderBytes || 0) + (meta.responsePayloadBytes || 0);

  const reqStr = `Req: ${formatBytes(totalReq)} (H: ${meta.requestHeaderSize}, B: ${meta.requestPayloadSize})`;
  const resStr = `Res: ${formatBytes(totalRes)} (H: ${meta.responseHeaderSize || '0 B'}, B: ${meta.responsePayloadSize || '0 B'})`;

  let userLabel: string | undefined;
  if (meta.user !== undefined && meta.user !== null) {
    if (formatUserLabel) {
      userLabel = formatUserLabel(meta.user);
    } else if (typeof meta.user === 'string') {
      userLabel = meta.user;
    } else if (typeof meta.user === 'object') {
      const u = meta.user as Record<string, unknown>;
      userLabel = (u.email || u.id || u.sub || u.username || u.name) as string | undefined;
    }
  }

  const userStr = userLabel ? ` | User: ${userLabel}` : '';

  return `${meta.method} ${meta.path}${statusStr}${durationStr} | IP: ${meta.clientIp}${countryStr} | ${reqStr} | ${resStr}${userStr}`;
}
