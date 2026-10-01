import { Worker, Job, WorkerOptions } from 'bullmq';
import { Redis } from 'ioredis';
import { getSharedRedisConnection } from './connection.js';

export type JobProcessor<T, R = void> = (job: Job<T, R, string>) => Promise<R>;

export interface FifoWorkerOptions {
  /**
   * Concurrency level. Defaults to 1 for strict serial FIFO execution.
   */
  concurrency?: number;
  connection?: Redis;
  limiter?: {
    max: number;
    duration: number;
  };
}

export class FifoWorker<T = unknown, R = void> {
  private worker: Worker<T, R, string>;
  public readonly name: string;

  constructor(
    queueName: string,
    processor: JobProcessor<T, R>,
    options?: FifoWorkerOptions
  ) {
    this.name = queueName;
    const redisConn = options?.connection || getSharedRedisConnection();

    const workerOptions: WorkerOptions = {
      connection: redisConn,
      concurrency: options?.concurrency ?? 1, // Default concurrency: 1 ensures strict sequential FIFO
      limiter: options?.limiter,
    };

    this.worker = new Worker<T, R, string>(queueName, processor, workerOptions);

    this.worker.on('completed', (job: Job<T, R, string>) => {
      console.log(`[FifoWorker:${this.name}] Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job: Job<T, R, string> | undefined, err: Error) => {
      console.error(
        `[FifoWorker:${this.name}] Job ${job?.id ?? 'unknown'} failed: ${err.message}`,
        err.stack
      );
    });

    this.worker.on('error', (err: Error) => {
      console.error(`[FifoWorker:${this.name}] Worker internal error: ${err.message}`);
    });
  }

  /**
   * Register custom completion handler
   */
  onCompleted(handler: (job: Job<T, R, string>, result: R) => void) {
    this.worker.on('completed', handler);
  }

  /**
   * Register custom failure handler
   */
  onFailed(handler: (job: Job<T, R, string> | undefined, err: Error) => void) {
    this.worker.on('failed', handler);
  }

  /**
   * Gracefully close worker, awaiting current in-progress job
   */
  async close(): Promise<void> {
    console.log(`[FifoWorker:${this.name}] Closing worker gracefully...`);
    await this.worker.close();
    console.log(`[FifoWorker:${this.name}] Worker closed.`);
  }

  get underlyingWorker(): Worker<T, R, string> {
    return this.worker;
  }
}
