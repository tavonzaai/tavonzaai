/**
 * @tavonza/observability — String & Metric Formatters
 */

import type { LogLevel } from './types.js';

/**
 * Formats a duration in ms to a readable string: 1ms, 234ms, 1.23s
 */
export function formatDuration(ms: number): string {
  if (isNaN(ms) || ms < 0) return '0ms';
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

/**
 * Formats a byte count to a readable string: 0 B, 512 B, 1.45 KB, 2.30 MB
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

// ── ANSI Color Codes for Dev Terminal ─────────────────────────────────────────

export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';

export function levelColour(level: LogLevel): string {
  switch (level) {
    case 'debug': return '\x1b[36m'; // cyan
    case 'info':  return '\x1b[32m'; // green
    case 'warn':  return '\x1b[33m'; // yellow
    case 'error': return '\x1b[31m'; // red
  }
}
