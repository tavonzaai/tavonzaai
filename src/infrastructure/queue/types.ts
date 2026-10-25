export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATIONS: 'notifications-queue',
  OUTBOX: 'outbox-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface EmailJobPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string[];
  configurationSetName?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface NotificationJobPayload {
  channel: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface OutboxJobPayload {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface FifoJobOptions {
  jobId?: string;
  attempts?: number;
  backoffDelayMs?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}
