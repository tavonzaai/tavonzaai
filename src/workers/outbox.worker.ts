import { Injectable, Optional, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { normalizeRedisUrl } from '@/infrastructure/queue';
import {
  createDrizzleDatabase,
  OutboxService,
  DRIZZLE,
  type DrizzleDatabase,
} from '@/database';
import { RealtimeChannels } from '@/common/events';

@Injectable()
export class OutboxProcessor {
  private redis: Redis | null = null;
  private outboxService: OutboxService | null = null;
  private isRunning = false;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    @Optional() @Inject(DRIZZLE) private readonly injectedDb?: DrizzleDatabase,
    @Optional() private readonly injectedOutboxService?: OutboxService,
  ) {
    if (injectedOutboxService) {
      this.outboxService = injectedOutboxService;
    }
  }

  async start(): Promise<void> {
    const redisUrl = normalizeRedisUrl();
    try {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
      });
      await this.redis.connect();
      console.log('[OutboxProcessor] Connected to Redis for event publishing');
    } catch (err: any) {
      console.warn(`[OutboxProcessor] Redis unavailable: ${err.message}. Events will be recorded in DB but not published in realtime.`);
    }

    if (!this.outboxService) {
      const db = this.injectedDb || (process.env.DATABASE_URL ? createDrizzleDatabase(process.env.DATABASE_URL) : null);
      if (db) {
        this.outboxService = new OutboxService(db);
      }
    }

    if (!this.outboxService) {
      console.warn('[OutboxProcessor] Database not configured. Outbox processing disabled.');
      return;
    }

    this.isRunning = true;
    console.log('[OutboxProcessor] Transactional Outbox processor started.');
    this.poll();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.redis) {
      this.redis.quit().catch(() => {});
    }
  }

  private async poll(): Promise<void> {
    if (!this.isRunning || !this.outboxService) return;

    try {
      const events = await this.outboxService.getPendingEvents(50);

      if (events.length > 0) {
        for (const event of events) {
          try {
            await this.publishEvent(event);
            await this.outboxService.markPublished(event.id);
          } catch (err: any) {
            console.error(`[OutboxProcessor] Failed to publish event ${event.id}:`, err.message);
            await this.outboxService.markFailed(event.id, err.message);
          }
        }
      }
    } catch (err: any) {
      console.error('[OutboxProcessor] Polling loop error:', err.message);
    }

    // Schedule next poll interval (1.5 seconds)
    if (this.isRunning) {
      this.timeoutId = setTimeout(() => this.poll(), 1500);
    }
  }

  private async publishEvent(event: any): Promise<void> {
    if (!this.redis) return;

    // 1. Publish to branch-scoped topic if branchId is present
    if (event.branchId) {
      const branchChannel = RealtimeChannels.branch(event.branchId);
      await this.redis.publish(
        branchChannel,
        JSON.stringify({
          eventType: event.eventType,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          data: event.payload,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // 2. Publish to specific functional channels based on aggregateType
    switch (event.aggregateType) {
      case 'ORDER': {
        if (event.branchId) {
          await this.redis.publish(
            RealtimeChannels.kitchenStation(event.branchId, 'KITCHEN'),
            JSON.stringify({ eventType: event.eventType, order: event.payload })
          );
        }
        break;
      }
      case 'TABLE_SESSION': {
        if (event.aggregateId) {
          await this.redis.publish(
            RealtimeChannels.session(event.aggregateId),
            JSON.stringify({ eventType: event.eventType, session: event.payload })
          );
        }
        break;
      }
      case 'PAYMENT': {
        if (event.branchId) {
          await this.redis.publish(
            RealtimeChannels.cashier(event.branchId),
            JSON.stringify({ eventType: event.eventType, payment: event.payload })
          );
        }
        break;
      }
    }
  }
}
