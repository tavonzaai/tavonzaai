// ============================================================================
// Auth Cache Service — High-performance Redis caching for Sessions, Users & RBAC
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { getSharedRedisConnection } from '@/infrastructure/queue/connection';
import type { Redis } from 'ioredis';

const SESSION_CACHE_TTL_SECONDS = 60; // 60s TTL for active sessions
const USER_CACHE_TTL_SECONDS = 60;    // 60s TTL for user status
const PERMS_CACHE_TTL_SECONDS = 60;   // 60s TTL for effective RBAC permissions

@Injectable()
export class AuthCacheService {
  private readonly logger = new Logger(AuthCacheService.name);
  private redis: Redis | null = null;

  constructor() {
    try {
      this.redis = getSharedRedisConnection();
    } catch (err: any) {
      this.logger.warn(`Redis client unavailable for AuthCache: ${err?.message}`);
    }
  }

  // ── Session Usability ────────────────────────────────────────────────────

  async isSessionUsable(sid: string): Promise<boolean | null> {
    if (!this.redis) return null;
    try {
      const val = await this.redis.get(`auth:session:${sid}`);
      if (val === null) return null;
      return val === '1';
    } catch {
      return null;
    }
  }

  async setSessionUsable(sid: string, usable: boolean, ttl = SESSION_CACHE_TTL_SECONDS): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(`auth:session:${sid}`, usable ? '1' : '0', 'EX', ttl);
    } catch {}
  }

  async invalidateSession(sid: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(`auth:session:${sid}`);
    } catch {}
  }

  // ── User Status ──────────────────────────────────────────────────────────

  async isUserActive(userId: string): Promise<boolean | null> {
    if (!this.redis) return null;
    try {
      const val = await this.redis.get(`auth:user:${userId}`);
      if (val === null) return null;
      return val === '1';
    } catch {
      return null;
    }
  }

  async setUserActive(userId: string, active: boolean, ttl = USER_CACHE_TTL_SECONDS): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(`auth:user:${userId}`, active ? '1' : '0', 'EX', ttl);
    } catch {}
  }

  async invalidateUser(userId: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(`auth:user:${userId}`, `auth:perms:${userId}`);
    } catch {}
  }

  // ── RBAC Permissions & Scopes ───────────────────────────────────────────

  async getEffectivePermissions(
    userId: string,
  ): Promise<{ permissions: string[]; scopes: any[] } | null> {
    if (!this.redis) return null;
    try {
      const val = await this.redis.get(`auth:perms:${userId}`);
      if (!val) return null;
      return JSON.parse(val);
    } catch {
      return null;
    }
  }

  async setEffectivePermissions(
    userId: string,
    data: { permissions: string[]; scopes: any[] },
    ttl = PERMS_CACHE_TTL_SECONDS,
  ): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(`auth:perms:${userId}`, JSON.stringify(data), 'EX', ttl);
    } catch {}
  }

  async invalidatePermissions(userId: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(`auth:perms:${userId}`);
    } catch {}
  }
}

