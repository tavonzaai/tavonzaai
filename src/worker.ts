/**
 * Tavonza AI — Background Worker Entrypoint
 * Handles asynchronous background workloads, FIFO email delivery via AWS SES,
 * outbox event propagation, idle session cleanup, and multichannel notifications.
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });
config();

import { closeSharedRedisConnection } from '@/infrastructure/queue';
import { createEmailWorker } from './workers/email.worker';
import { createNotificationWorker } from './workers/notification.worker';
import { OutboxProcessor } from './workers/outbox.worker';
import { IdleSessionJob } from './workers/idle-session.job';

async function bootstrapWorker() {
  console.log('====================================================');
  console.log('  🚀 Tavonza AI Background Worker Starting');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Redis URL:   ${(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) ? '[CONFIGURED]' : 'redis://localhost:6379'}`);
  console.log('====================================================');

  // Initialize workers with strict FIFO handling
  const emailWorker = createEmailWorker();
  const notificationWorker = createNotificationWorker();
  const activeWorkers = [emailWorker, notificationWorker];

  // Initialize Transactional Outbox processor & Scheduled maintenance
  const outboxProcessor = new OutboxProcessor();
  await outboxProcessor.start();

  const idleSessionJob = new IdleSessionJob();
  await idleSessionJob.start();

  console.log('✅ All FIFO background workers, outbox processor, and maintenance jobs are active.');

  // Graceful shutdown handler
  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Commencing graceful shutdown of workers...`);

    outboxProcessor.stop();
    idleSessionJob.stop();

    const shutdownPromises = activeWorkers.map((w) => w.close());
    await Promise.allSettled(shutdownPromises);
    await closeSharedRedisConnection();

    console.log('👋 All workers halted and connections closed. Goodbye.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrapWorker().catch((err) => {
  console.error('💥 Fatal error during worker startup:', err);
  process.exit(1);
});
