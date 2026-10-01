/**
 * @tavonza/observability
 * Structured JSON logger for all Tavonza AI services.
 *
 * Outputs plain pretty logs in development, JSON lines in production
 * so CloudWatch Logs Insights / any log aggregator can parse them easily.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  [key: string]: unknown;
}

const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Formats a duration in ms to a readable string: 1ms, 234ms, 1.23s
 */
export function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

/**
 * Returns an ANSI colour code for the given log level (dev mode only).
 */
function levelColour(level: LogLevel): string {
  switch (level) {
    case 'debug': return '\x1b[36m'; // cyan
    case 'info':  return '\x1b[32m'; // green
    case 'warn':  return '\x1b[33m'; // yellow
    case 'error': return '\x1b[31m'; // red
  }
}

const RESET = '\x1b[0m';
const DIM   = '\x1b[2m';
const BOLD  = '\x1b[1m';

/**
 * AppLogger — structured logger that wraps console output.
 *
 * In production  → outputs newline-delimited JSON (CloudWatch friendly)
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
      const tag    = `${colour}${BOLD}[${level.toUpperCase().padEnd(5)}]${RESET}`;
      const ctx    = `${DIM}[${this.context}]${RESET}`;
      const ts     = `${DIM}${timestamp}${RESET}`;
      let line     = `${ts} ${tag} ${ctx} ${message}`;

      if (meta && Object.keys(meta).length > 0) {
        // Pretty-print meta fields inline, one per line, indented
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
