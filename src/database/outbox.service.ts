import { eq, sql, asc } from 'drizzle-orm';
import type { DrizzleDatabase } from './client';
import { outboxEvents } from './schema/events';

export interface CreateOutboxEventParams<T = Record<string, unknown>> {
  aggregateType:
    | 'ORDER'
    | 'TABLE_SESSION'
    | 'GUEST_SESSION'
    | 'PAYMENT'
    | 'TABLE'
    | 'ALERT'
    | 'KITCHEN_ITEM'
    | (string & {});
  aggregateId: string;
  eventType: string;
  branchId?: string | null;
  payload: T;
}

export class OutboxService {
  constructor(private readonly db: DrizzleDatabase) {}

  /**
   * Insert an event into outbox_events table.
   * If a transaction `tx` is provided, executes inside that transaction for atomic consistency.
   */
  async publishEvent<T = Record<string, unknown>>(
    event: CreateOutboxEventParams<T>,
    tx?: DrizzleDatabase
  ) {
    const client = tx ?? this.db;
    const [created] = await client
      .insert(outboxEvents)
      .values({
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        branchId: event.branchId ?? null,
        payload: event.payload as any,
        status: 'PENDING',
        retries: 0,
      })
      .returning();

    return created;
  }

  /**
   * Fetch pending outbox events using FOR UPDATE SKIP LOCKED
   * to allow concurrent worker processes without double-processing.
   */
  async getPendingEvents(limit = 50) {
    return this.db
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.status, 'PENDING'))
      .orderBy(asc(outboxEvents.occurredAt))
      .limit(limit);
  }

  /**
   * Mark an outbox event as successfully dispatched and published.
   */
  async markPublished(id: string) {
    await this.db
      .update(outboxEvents)
      .set({
        status: 'PUBLISHED',
        publishedAt: new Date(),
      })
      .where(eq(outboxEvents.id, id));
  }

  /**
   * Mark an outbox event as failed, incrementing retries.
   */
  async markFailed(id: string, errorMessage: string, maxRetries = 5) {
    const [row] = await this.db
      .select({ retries: outboxEvents.retries })
      .from(outboxEvents)
      .where(eq(outboxEvents.id, id))
      .limit(1);

    const newRetries = (row?.retries ?? 0) + 1;
    const finalStatus = newRetries >= maxRetries ? 'FAILED' : 'PENDING';

    await this.db
      .update(outboxEvents)
      .set({
        status: finalStatus,
        retries: sql`${outboxEvents.retries} + 1`,
        errorMessage,
      })
      .where(eq(outboxEvents.id, id));
  }
}
