// ============================================================================
// Alert Repository — Ephemeral Customer Operational Alerts
// ============================================================================

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { CustomerAlert, AlertType } from '../../domain/entities/waiter.entity';

@Injectable()
export class DrizzleAlertRepository {
  private alerts: Map<string, CustomerAlert> = new Map();

  async create(data: {
    branchId: string;
    tableId: string;
    tableSessionId: string;
    customerSessionId?: string;
    type: AlertType;
    message?: string;
  }): Promise<CustomerAlert> {
    const alert: CustomerAlert = {
      id: randomUUID(),
      branchId: data.branchId,
      tableId: data.tableId,
      tableSessionId: data.tableSessionId,
      customerSessionId: data.customerSessionId ?? null,
      type: data.type,
      message: data.message ?? null,
      status: 'pending',
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  async findPendingForBranch(branchId: string): Promise<CustomerAlert[]> {
    const branchAlerts: CustomerAlert[] = [];
    for (const alert of this.alerts.values()) {
      if (alert.branchId === branchId && (alert.status === 'pending' || alert.status === 'acknowledged')) {
        branchAlerts.push(alert);
      }
    }
    return branchAlerts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findById(alertId: string): Promise<CustomerAlert | null> {
    return this.alerts.get(alertId) ?? null;
  }

  async acknowledge(alertId: string, waiterId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedById = waiterId;
      alert.acknowledgedAt = new Date();
      this.alerts.set(alertId, alert);
    }
  }

  async resolve(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      this.alerts.set(alertId, alert);
    }
  }
}
