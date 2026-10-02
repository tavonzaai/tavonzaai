/**
 * Worker Service Entrypoint
 * Handles asynchronous background workloads, FIFO email delivery via AWS SES,
 * outbox event propagation, and multichannel notifications.
 */
import { closeSharedRedisConnection } from '@tavonza/queue';
import { createEmailWorker } from './notifications/email.worker.js';
import { createNotificationWorker } from './notifications/notification.worker.js';
import { createOutboxWorker } from './outbox/outbox.worker.js';

async function bootstrap() {
  console.log('====================================================');
  console.log('  🚀 Tavonza AI Worker Service Starting');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Redis URL:   ${process.env.REDIS_URL ? '[CONFIGURED]' : 'redis://localhost:6379'}`);
  console.log('====================================================');

  // Initialize workers with strict FIFO handling
  const emailWorker = createEmailWorker();
  const notificationWorker = createNotificationWorker();
  const outboxWorker = createOutboxWorker();

  const activeWorkers = [emailWorker, notificationWorker, outboxWorker];

  console.log('✅ All FIFO background workers active and listening for jobs.');

  // Graceful shutdown handler
  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Commencing graceful shutdown of workers...`);

    const shutdownPromises = activeWorkers.map((w) => w.close());
    await Promise.allSettled(shutdownPromises);
    await closeSharedRedisConnection();

    console.log('👋 All workers halted and connections closed. Goodbye.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('💥 Fatal error during worker startup:', err);
  process.exit(1);
});
