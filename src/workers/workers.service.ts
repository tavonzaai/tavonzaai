import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { closeSharedRedisConnection } from '@/infrastructure/queue';
import { createEmailWorker } from './email.worker';
import { createNotificationWorker } from './notification.worker';
import { OutboxProcessor } from './outbox.worker';
import { IdleSessionJob } from './idle-session.job';

@Injectable()
export class WorkersService implements OnModuleInit, OnModuleDestroy {
  private activeWorkers: Array<{ close: () => Promise<void> }> = [];

  constructor(
    private readonly outboxProcessor: OutboxProcessor,
    private readonly idleSessionJob: IdleSessionJob,
  ) {}

  async onModuleInit() {
    // Only launch background queue workers if explicitly in worker mode or non-production dev
    const isWorker = process.env.IS_WORKER === 'true';
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isWorker && !isDev) {
      return;
    }

    console.log('[WorkersService] Starting background workers and maintenance jobs...');

    const emailWorker = createEmailWorker();
    const notificationWorker = createNotificationWorker();
    this.activeWorkers = [emailWorker, notificationWorker];

    await this.outboxProcessor.start();
    await this.idleSessionJob.start();

    console.log('✅ Background workers (FIFO queues, Outbox, Idle Sessions) are active.');
  }

  async onModuleDestroy() {
    console.log('[WorkersService] Gracefully stopping background workers...');
    this.outboxProcessor.stop();
    this.idleSessionJob.stop();

    const shutdownPromises = this.activeWorkers.map((w) => w.close());
    await Promise.allSettled(shutdownPromises);
    await closeSharedRedisConnection();
    console.log('👋 Background workers cleanly halted.');
  }
}
