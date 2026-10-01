import { Redis, RedisOptions } from 'ioredis';

let sharedConnection: Redis | null = null;

export interface RedisConnectionConfig {
  url?: string;
  enableTls?: boolean;
}

/**
 * Creates or retrieves a singleton ioredis connection configured for BullMQ and AWS ElastiCache.
 */
export function getRedisConnection(config?: RedisConnectionConfig): Redis {
  const redisUrl = config?.url || process.env.REDIS_URL || 'redis://localhost:6379';

  const options: RedisOptions = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  };

  // Support TLS for AWS ElastiCache Serverless or rediss:// endpoints
  if (redisUrl.startsWith('rediss://') || config?.enableTls) {
    options.tls = {
      rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
    };
  }

  const client = new Redis(redisUrl, options);

  // Attach error handler to prevent Node.js from throwing unhandled 'error' events if Redis is temporarily unreachable
  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      // Debounce or quietly log connection issues in development
      if (err.message.includes('ECONNREFUSED')) {
        // Quietly handled — developer might not have started Redis container yet
        return;
      }
    }
    console.error(`[RedisConnection] Error: ${err.message}`);
  });

  return client;
}

/**
 * Returns a shared Redis connection instance to avoid opening excessive sockets.
 */
export function getSharedRedisConnection(config?: RedisConnectionConfig): Redis {
  if (!sharedConnection || sharedConnection.status === 'end') {
    sharedConnection = getRedisConnection(config);
  }
  return sharedConnection;
}

/**
 * Closes the shared connection cleanly.
 */
export async function closeSharedRedisConnection(): Promise<void> {
  if (sharedConnection) {
    await sharedConnection.quit();
    sharedConnection = null;
  }
}
