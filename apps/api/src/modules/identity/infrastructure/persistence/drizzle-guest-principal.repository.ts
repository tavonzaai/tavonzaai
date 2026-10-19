import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  guestSessions,
  tableSessions,
} from '@tavonza/database';

/** Table sessions in which a seated guest may still act (order, pay, track). */
export const OPEN_TABLE_SESSION_STATUSES = ['ACTIVE', 'BILL_REQUESTED'] as const;

@Injectable()
export class DrizzleGuestPrincipalRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  /** Returns the guest session only while it and its table session are open. */
  async findOpenGuestSession(guestSessionId: string) {
    const [row] = await this.db
      .select({
        guestSessionId: guestSessions.id,
        customerId: guestSessions.customerId,
        tableSessionId: tableSessions.id,
        tableId: tableSessions.tableId,
        branchId: tableSessions.branchId,
      })
      .from(guestSessions)
      .innerJoin(tableSessions, eq(tableSessions.id, guestSessions.tableSessionId))
      .where(
        and(
          eq(guestSessions.id, guestSessionId),
          eq(guestSessions.status, 'ACTIVE'),
          inArray(tableSessions.status, [...OPEN_TABLE_SESSION_STATUSES]),
        ),
      )
      .limit(1);
    return row ?? null;
  }
}
