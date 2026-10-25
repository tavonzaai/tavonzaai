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
    console.log('[WorkersService] Starting background workers and maintenance jobs...');

    try {
      const emailWorker = createEmailWorker();
      const notificationWorker = createNotificationWorker();
      this.activeWorkers = [emailWorker, notificationWorker];
    } catch (err: any) {
      console.warn(`[WorkersService] Queue worker initialization failed: ${err.message}. Queue processing will remain idle.`);
    }

    try {
      await this.outboxProcessor.start();
    } catch (err: any) {
      console.warn(`[WorkersService] Outbox processor initialization failed: ${err.message}`);
    }

    try {
      await this.idleSessionJob.start();
    } catch (err: any) {
      console.warn(`[WorkersService] Idle session job initialization failed: ${err.message}`);
    }

    console.log('✅ Background workers (FIFO queues, Outbox, Idle Sessions) initialized.');
  }

  async onModuleDestroy() {
    console.log('[WorkersService] Gracefully stopping background workers...');
    this.outboxProcessor.stop();
    this.idleSessionJob.stop();

    const shutdownPromises = this.activeWorkers.map((w) => w.close().catch(() => {}));
    await Promise.allSettled(shutdownPromises);
    await closeSharedRedisConnection();
    console.log('👋 Background workers cleanly halted.');
  }
}
