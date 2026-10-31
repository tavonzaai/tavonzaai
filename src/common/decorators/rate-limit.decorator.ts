import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimitOptions';

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  points: number;
  /** Window duration in seconds (default: 60) */
  duration: number;
}

/**
 * Decorator to apply rate limiting to a controller class or route handler.
 *
 * @param points Maximum requests allowed within duration
 * @param duration Time window in seconds (default: 60)
 */
export const RateLimit = (points: number, duration = 60) =>
  SetMetadata(RATE_LIMIT_KEY, { points, duration } satisfies RateLimitOptions);

