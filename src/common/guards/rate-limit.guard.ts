// ============================================================================
// Rate Limit Guard — Distributed Redis Rate Limiting with In-Memory Fallback
// ============================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, type RateLimitOptions } from '../decorators/rate-limit.decorator';
import { getSharedRedisConnection } from '@/infrastructure/queue/connection';
import type { Redis } from 'ioredis';

interface MemoryBucket {
  count: number;
  resetAt: number;
}
const memoryStore = new Map<string, MemoryBucket>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis | null = null;
  private readonly defaultLimit: RateLimitOptions = { points: 120, duration: 60 };

  constructor(private readonly reflector: Reflector) {
    try {
      this.redis = getSharedRedisConnection();
    } catch {
      this.redis = null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const routeLimit = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const limit = routeLimit || this.defaultLimit;
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const clientIp = this.resolveClientIp(request);
    const routePath = request.route?.path || request.path || 'unknown';
    const key = `rl:${routePath}:${clientIp}`;

    const { current, ttl } = await this.increment(key, limit.duration);

    if (response && typeof response.setHeader === 'function') {
      response.setHeader('X-RateLimit-Limit', limit.points);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, limit.points - current));
      response.setHeader('X-RateLimit-Reset', ttl);
    }

    if (current > limit.points) {
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('Retry-After', ttl);
      }
      throw new HttpException(
        'Too many requests. Please slow down and try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private resolveClientIp(req: any): string {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || '127.0.0.1';
  }

  private async increment(
    key: string,
    duration: number,
  ): Promise<{ current: number; ttl: number }> {
    if (this.redis) {
      try {
        const pipeline = this.redis.pipeline();
        pipeline.incr(key);
        pipeline.ttl(key);
        const results = await pipeline.exec();
        if (results && results[0] && results[1]) {
          const current = (results[0][1] as number) || 1;
          let ttl = (results[1][1] as number) || -1;
          if (ttl === -1) {
            await this.redis.expire(key, duration);
            ttl = duration;
          }
          return { current, ttl: Math.max(1, ttl) };
        }
      } catch {
        // Fall back to memoryStore on Redis failure
      }
    }

    const now = Date.now();
    let bucket = memoryStore.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 1, resetAt: now + duration * 1000 };
      memoryStore.set(key, bucket);
      return { current: 1, ttl: duration };
    }

    bucket.count += 1;
    const remainingTtlSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { current: bucket.count, ttl: remainingTtlSeconds };
  }
}

