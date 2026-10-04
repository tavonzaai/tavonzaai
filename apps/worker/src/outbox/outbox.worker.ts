import { Redis } from 'ioredis';
import {
  createDrizzleDatabase,
  OutboxService,
} from '@tavonza/database';
import { RealtimeChannels } from '@tavonza/events';

export class OutboxProcessor {
  private redis: Redis | null = null;
  private outboxService: OutboxService | null = null;
  private isRunning = false;
  private timeoutId: NodeJS.Timeout | null = null;

  async start(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn('[OutboxProcessor] DATABASE_URL not configured. Outbox processing disabled.');
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
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

    const db = createDrizzleDatabase(dbUrl);
    this.outboxService = new OutboxService(db);
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
          await this.processEvent(event);
        }
      }
    } catch (err: any) {
      console.error(`[OutboxProcessor] Error polling outbox events: ${err.message}`);
    } finally {
      if (this.isRunning) {
        this.timeoutId = setTimeout(() => this.poll(), 500);
      }
    }
  }

  private async processEvent(event: any): Promise<void> {
    if (!this.outboxService) return;

    try {
      const { id, eventType, branchId, payload } = event;
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

      const channels = this.resolveDestinationChannels(eventType, branchId, data);

      if (this.redis && channels.length > 0) {
        const payloadString = JSON.stringify({
          eventId: id,
          eventType,
          data,
          occurredAt: event.occurredAt,
        });

        for (const channel of channels) {
          await this.redis.publish(channel, payloadString);
        }
      }

      await this.outboxService.markPublished(id);
    } catch (err: any) {
      console.error(`[OutboxProcessor] Failed to publish event ${event.id}: ${err.message}`);
      await this.outboxService.markFailed(event.id, err.message);
    }
  }

  private resolveDestinationChannels(
    eventType: string,
    branchId: string | null,
    payload: Record<string, any>
  ): string[] {
    const channels: string[] = [];

    // Session-specific room
    if (payload.tableSessionId) {
      channels.push(RealtimeChannels.session(payload.tableSessionId));
    }

    if (branchId) {
      switch (eventType) {
        case 'OrderSubmitted':
          channels.push(RealtimeChannels.waiter(branchId));
          channels.push(RealtimeChannels.kitchenStation(branchId, 'KITCHEN'));
          channels.push(RealtimeChannels.kitchenStation(branchId, 'BAR'));
          break;

        case 'OrderAccepted':
          channels.push(RealtimeChannels.kitchenStation(branchId, 'KITCHEN'));
          channels.push(RealtimeChannels.kitchenStation(branchId, 'BAR'));
          break;

        case 'OrderRejected':
          channels.push(RealtimeChannels.waiter(branchId));
          break;

        case 'OrderKitchenStatusChanged':
          channels.push(RealtimeChannels.waiter(branchId));
          if (payload.stationType) {
            channels.push(RealtimeChannels.kitchenStation(branchId, payload.stationType));
          }
          break;

        case 'TableStatusChanged':
          channels.push(RealtimeChannels.waiter(branchId));
          channels.push(RealtimeChannels.manager(branchId));
          break;

        case 'PaymentCompleted':
          channels.push(RealtimeChannels.cashier(branchId));
          channels.push(RealtimeChannels.waiter(branchId));
          break;

        case 'WaiterCallAlert':
        case 'AlertAcknowledged':
          channels.push(RealtimeChannels.waiter(branchId));
          break;

        default:
          channels.push(RealtimeChannels.manager(branchId));
      }
    }

    return channels;
  }
}
