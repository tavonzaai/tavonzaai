import {
  FifoWorker,
  FifoQueue,
  QUEUE_NAMES,
  NotificationJobPayload,
  EmailJobPayload,
} from '@tavonza/queue';

export function createNotificationWorker(emailQueue?: FifoQueue<EmailJobPayload>): FifoWorker<NotificationJobPayload> {
  const mailQueue = emailQueue || new FifoQueue<EmailJobPayload>(QUEUE_NAMES.EMAIL);
  const concurrency = parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || '1', 10);

  console.log(`[NotificationWorker] Initializing worker on "${QUEUE_NAMES.NOTIFICATIONS}" with concurrency=${concurrency} (FIFO)`);

  const worker = new FifoWorker<NotificationJobPayload>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      const { channel, recipient, title, body, data } = job.data;
      console.log(`[NotificationWorker] Dispatching notification via [${channel}] to [${recipient}]`);

      switch (channel) {
        case 'email':
          // Route into the dedicated FIFO Email queue for AWS SES delivery
          await mailQueue.enqueue('notification-email', {
            to: recipient,
            subject: title,
            html: body,
            text: body.replace(/<[^>]*>?/gm, ''),
            metadata: data,
          });
          break;

        case 'sms':
        case 'push':
        case 'webhook':
          console.log(`[NotificationWorker] [${channel}] channel handled:`, { recipient, title });
          break;

        default:
          console.warn(`[NotificationWorker] Unsupported channel: ${(job.data as any).channel}`);
      }
    },
    {
      concurrency,
    }
  );

  return worker;
}
