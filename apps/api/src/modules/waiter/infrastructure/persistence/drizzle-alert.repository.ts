// ============================================================================
// Drizzle Alert Repository — Customer Alert Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import { customerAlerts } from '@tavonza/database';
import type { CustomerAlert, AlertType } from '../../domain/entities/waiter.entity';

type DrizzleDb = any;

@Injectable()
export class DrizzleAlertRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: {
    branchId: string;
    tableId: string;
    tableSessionId: string;
    customerSessionId?: string;
    type: AlertType;
    message?: string;
  }): Promise<CustomerAlert> {
    const result = await this.db
      .insert(customerAlerts)
      .values({
        branchId: data.branchId,
        tableId: data.tableId,
        tableSessionId: data.tableSessionId,
        customerSessionId: data.customerSessionId ?? null,
        type: data.type,
        message: data.message ?? null,
        status: 'pending',
      })
      .returning();
    return result[0];
  }

  async findPendingForBranch(branchId: string): Promise<CustomerAlert[]> {
    return this.db
      .select()
      .from(customerAlerts)
      .where(
        and(
          eq(customerAlerts.branchId, branchId),
          inArray(customerAlerts.status, ['pending', 'acknowledged']),
        ),
      )
      .orderBy(customerAlerts.createdAt);
  }

  async findById(alertId: string): Promise<CustomerAlert | null> {
    const result = await this.db
      .select()
      .from(customerAlerts)
      .where(eq(customerAlerts.id, alertId))
      .limit(1);
    return result[0] ?? null;
  }

  async acknowledge(alertId: string, waiterId: string): Promise<void> {
    await this.db
      .update(customerAlerts)
      .set({
        status: 'acknowledged',
        acknowledgedById: waiterId,
        acknowledgedAt: new Date(),
      })
      .where(eq(customerAlerts.id, alertId));
  }

  async resolve(alertId: string): Promise<void> {
    await this.db
      .update(customerAlerts)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
      })
      .where(eq(customerAlerts.id, alertId));
  }
}
