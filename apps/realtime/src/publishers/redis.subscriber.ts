import { Redis } from 'ioredis';
import type { ChannelManager } from '../channels/channel.manager';

export class RedisSubscriber {
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly channelManager: ChannelManager) {}

  async start(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 10) return null; // stop retrying after 10 attempts
          return Math.min(times * 500, 3000);
        },
      });

      this.client.on('error', (err) => {
        console.warn(`[RedisSubscriber] Redis error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('[RedisSubscriber] Connected to Redis Pub/Sub successfully');
      });

      this.client.on('pmessage', (_pattern, channel, message) => {
        try {
          const parsed = JSON.parse(message);
          this.channelManager.broadcastToChannel(channel, parsed);
        } catch {
          this.channelManager.broadcastToChannel(channel, message);
        }
      });

      await this.client.connect();

      // Subscribe to all scoped branch and session channels
      await this.client.psubscribe('session:*', 'branch:*', 'tavonza:*');
      console.log('[RedisSubscriber] Subscribed to patterns: session:*, branch:*, tavonza:*');
    } catch (err: any) {
      console.warn(`[RedisSubscriber] Running in standalone mode (Redis unavailable: ${err.message})`);
    }
  }

  async close(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.punsubscribe();
        await this.client.quit();
      } catch {
        // ignore disconnect errors
      }
    }
  }
}
