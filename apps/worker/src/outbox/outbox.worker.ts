import {
  FifoWorker,
  QUEUE_NAMES,
  OutboxJobPayload,
} from '@tavonza/queue';

export function createOutboxWorker(): FifoWorker<OutboxJobPayload, void> {
  const concurrency = parseInt(process.env.OUTBOX_WORKER_CONCURRENCY || '1', 10);

  console.log(`[OutboxWorker] Initializing worker on "${QUEUE_NAMES.OUTBOX}" with concurrency=${concurrency} (FIFO)`);

  const worker = new FifoWorker<OutboxJobPayload, void>(
    QUEUE_NAMES.OUTBOX,
    async (job) => {
      const { eventId, eventType, aggregateId, aggregateType, occurredAt } = job.data;
      console.log(
        `[OutboxWorker] Processing outbox event: [${eventType}] (Aggregate: ${aggregateType}#${aggregateId}, Event ID: ${eventId}, Occurred: ${occurredAt})`
      );
      // Event publication hook for consumers, analytics, or webhook dispatch
    },
    {
      concurrency, // 1 ensures outbox events are published in strict causal FIFO order
    }
  );

  return worker;
}
