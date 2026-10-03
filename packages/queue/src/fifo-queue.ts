import { Queue, JobsOptions, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { getSharedRedisConnection } from './connection.js';
import { FifoJobOptions } from './types.js';

export class FifoQueue<T = any> {
  private queue: Queue;
  public readonly name: string;

  constructor(queueName: string, connection?: Redis) {
    this.name = queueName;
    const redisConn = connection || getSharedRedisConnection();

    this.queue = new Queue(queueName, {
      connection: redisConn,
      prefix: '{bull}',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100, // Retain last 100 completed jobs for audit
        removeOnFail: 500,     // Retain failed jobs for dead-letter analysis
      },
    });
  }

  /**
   * Pushes a job to the FIFO queue.
   * Jobs are processed strictly in the order they are inserted (FIFO).
   */
  async enqueue(name: string, data: T, opts?: FifoJobOptions): Promise<Job<T>> {
    const jobOptions: JobsOptions = {};

    if (opts?.jobId) {
      jobOptions.jobId = opts.jobId;
    }
    if (opts?.attempts !== undefined) {
      jobOptions.attempts = opts.attempts;
    }
    if (opts?.backoffDelayMs !== undefined) {
      jobOptions.backoff = {
        type: 'exponential',
        delay: opts.backoffDelayMs,
      };
    }
    if (opts?.removeOnComplete !== undefined) {
      jobOptions.removeOnComplete = opts.removeOnComplete;
    }
    if (opts?.removeOnFail !== undefined) {
      jobOptions.removeOnFail = opts.removeOnFail;
    }

    return (this.queue as any).add(name, data, jobOptions);
  }

  /**
   * Pushes multiple jobs sequentially into the FIFO queue in atomic order.
   */
  async enqueueBulk(jobs: Array<{ name: string; data: T; opts?: FifoJobOptions }>): Promise<Job<T>[]> {
    const bullJobs = jobs.map((job) => ({
      name: job.name,
      data: job.data,
      opts: {
        jobId: job.opts?.jobId,
        attempts: job.opts?.attempts ?? 3,
        backoff: {
          type: 'exponential',
          delay: job.opts?.backoffDelayMs ?? 1000,
        },
        removeOnComplete: job.opts?.removeOnComplete ?? 100,
        removeOnFail: job.opts?.removeOnFail ?? 500,
      } as JobsOptions,
    }));

    return (this.queue as any).addBulk(bullJobs);
  }

  /**
   * Retrieves pending, active, and completed job counts.
   */
  async getJobCounts() {
    return this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
  }

  /**
   * Gracefully close queue connection.
   */
  async close(): Promise<void> {
    await this.queue.close();
  }

  /**
   * Get underlying BullMQ instance if direct access is required.
   */
  get underlyingQueue(): Queue {
    return this.queue;
  }
}
