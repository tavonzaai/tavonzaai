/**
 * @tavonza/observability — Structured Logger Engine
 */

import type { LogLevel, LogRecord } from './types.js';
import { levelColour, RESET, DIM, BOLD } from './formatters.js';

const IS_PROD = process.env.NODE_ENV === 'production';
const IS_VERBOSE = process.env.LOG_VERBOSE === 'true';

// Redundant metadata keys already captured in standard summary lines
const REDUNDANT_DEV_KEYS = new Set([
  'method',
  'path',
  'statusCode',
  'errorCode',
  'duration',
  'durationMs',
  'clientIp',
  'country',
  'httpVersion',
  'requestHeaderBytes',
  'requestHeaderSize',
  'requestPayloadBytes',
  'requestPayloadSize',
  'requestHeadersCount',
  'requestContentType',
  'responseHeaderBytes',
  'responseHeaderSize',
  'responsePayloadBytes',
  'responsePayloadSize',
  'responseContentType',
  'userAgent',
  'referrer',
  'user',
  'requestId',
  'query',
  'body',
]);

/**
 * AppLogger — Structured logger that wraps console output.
 *
 * In production  → outputs clean newline-delimited JSON (CloudWatch / Datadog / ELK friendly)
 * In development → outputs clean, single-line, human-readable lines without multi-line clutter
 */
export class AppLogger {
  constructor(private readonly context: string) {}

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();

    if (IS_PROD) {
      // ── JSON mode (production) ────────────────────────────────────────────
      // Filter out undefined keys to keep JSON compact and clean
      const cleanMeta: Record<string, unknown> = {};
      if (meta) {
        for (const [k, v] of Object.entries(meta)) {
          if (v !== undefined) cleanMeta[k] = v;
        }
      }
      const record: LogRecord = { timestamp, level, context: this.context, message, ...cleanMeta };
      process.stdout.write(JSON.stringify(record) + '\n');
      return;
    }

    // ── Pretty mode (development) ─────────────────────────────────────────
    const colour = levelColour(level);
    const tag = `${colour}${BOLD}[${level.toUpperCase().padEnd(5)}]${RESET}`;
    const ctx = `${DIM}[${this.context}]${RESET}`;
    const ts = `${DIM}${timestamp}${RESET}`;
    let line = `${ts} ${tag} ${ctx} ${message}`;

    // In dev mode, only print extra lines if there is meaningful diagnostic info
    if (meta && Object.keys(meta).length > 0) {
      const extraLines: string[] = [];

      // If stack trace is present on errors, print it indented
      if (meta.stack && typeof meta.stack === 'string') {
        extraLines.push(`  ${colour}${meta.stack.trim()}${RESET}`);
      }

      const isHttpOrException = this.context === 'HTTP' || this.context === 'ExceptionFilter';

      for (const [k, v] of Object.entries(meta)) {
        if (k === 'stack') continue;
        if (v === undefined || v === null || v === '') continue;

        // In HTTP and Exception contexts, skip keys already summarized in the single-line message
        if (isHttpOrException && !IS_VERBOSE && REDUNDANT_DEV_KEYS.has(k)) {
          continue;
        }

        // Skip empty objects or arrays
        if (typeof v === 'object' && Object.keys(v as object).length === 0) {
          continue;
        }

        const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
        extraLines.push(`  ${DIM}${k}:${RESET} ${val}`);
      }

      if (extraLines.length > 0) {
        line += '\n' + extraLines.join('\n');
      }
    }

    console.log(line);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'debug') this.write('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }
}
