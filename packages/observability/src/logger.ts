/**
 * @tavonza/observability — Structured Logger Engine
 */

import type { LogLevel, LogRecord } from './types.js';
import { levelColour, RESET, DIM, BOLD } from './formatters.js';

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * AppLogger — Structured logger that wraps console output.
 *
 * In production  → outputs newline-delimited JSON (CloudWatch / Datadog / ELK friendly)
 * In development → outputs colour-coded, human-readable lines
 */
export class AppLogger {
  constructor(private readonly context: string) {}

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();

    if (IS_PROD) {
      // ── JSON mode (production) ────────────────────────────────────────────
      const record: LogRecord = { timestamp, level, context: this.context, message, ...meta };
      process.stdout.write(JSON.stringify(record) + '\n');
    } else {
      // ── Pretty mode (development) ─────────────────────────────────────────
      const colour = levelColour(level);
      const tag = `${colour}${BOLD}[${level.toUpperCase().padEnd(5)}]${RESET}`;
      const ctx = `${DIM}[${this.context}]${RESET}`;
      const ts = `${DIM}${timestamp}${RESET}`;
      let line = `${ts} ${tag} ${ctx} ${message}`;

      if (meta && Object.keys(meta).length > 0) {
        const metaLines = Object.entries(meta)
          .map(([k, v]) => {
            const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
            return `  ${DIM}${k}:${RESET} ${val}`;
          })
          .join('\n');
        line += '\n' + metaLines;
      }

      console.log(line);
    }
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
