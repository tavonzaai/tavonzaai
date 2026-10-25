/**
 * @tavonza/events
 * Domain events, channel definitions, and outbox event envelopes
 */

export * from './channels.js';
export * from './order.events.js';
export * from './session.events.js';
export * from './payment.events.js';
export * from './staff.events.js';
export * from './notification.events.js';

import type { OrderEvent } from './order.events.js';
import type { SessionEvent } from './session.events.js';
import type { PaymentEvent } from './payment.events.js';
import type { StaffAlertEvent } from './staff.events.js';
import type { NotificationEvent } from './notification.events.js';

export type TavonzaDomainEvent =
  | OrderEvent
  | SessionEvent
  | PaymentEvent
  | StaffAlertEvent
  | NotificationEvent;

export interface OutboxEnvelope<T = Record<string, unknown>> {
  id: string;
  aggregateType: 'ORDER' | 'TABLE_SESSION' | 'PAYMENT' | 'TABLE' | 'ALERT' | 'NOTIFICATION';
  aggregateId: string;
  eventType: string;
  branchId?: string | null;
  payload: T;
  occurredAt: Date | string;
}
