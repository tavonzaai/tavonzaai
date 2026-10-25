// ============================================================================
// Order Domain — Domain Events
// ============================================================================
// Events represent things that happened. They're emitted AFTER state changes.
// Consumers: Waiter notification, Kitchen, Audit, Realtime updates.
// ============================================================================

import type { OrderStatus } from '../enums/order-status.enum';

/** Emitted when a customer submits their cart (DRAFT → SUBMITTED). */
export class OrderSubmittedEvent {
  readonly eventName = 'order.submitted';

  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly branchId: string,
    public readonly tableId: string,
    public readonly itemCount: number,
    public readonly total: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

/** Emitted when an order's status changes. */
export class OrderStatusChangedEvent {
  readonly eventName = 'order.status_changed';

  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly branchId: string,
    public readonly tableId: string,
    public readonly previousStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly timestamp: Date = new Date(),
  ) {}
}
