import {
  FifoWorker,
  QUEUE_NAMES,
  EmailJobPayload,
  SESEmailDispatcher,
} from '@tavonza/queue';

export function createEmailWorker(dispatcher?: SESEmailDispatcher): FifoWorker<EmailJobPayload, void> {
  const sesDispatcher = dispatcher || new SESEmailDispatcher();
  const concurrency = parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '1', 10);

  console.log(`[EmailWorker] Initializing worker on "${QUEUE_NAMES.EMAIL}" with concurrency=${concurrency} (FIFO)`);

  const worker = new FifoWorker<EmailJobPayload, void>(
    QUEUE_NAMES.EMAIL,
    async (job) => {
      console.log(`[EmailWorker] Processing job ${job.id} for: ${Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to}`);
      await sesDispatcher.send(job.data);
    },
    {
      concurrency, // 1 guarantees strict sequential FIFO execution
    }
  );

  return worker;
}
