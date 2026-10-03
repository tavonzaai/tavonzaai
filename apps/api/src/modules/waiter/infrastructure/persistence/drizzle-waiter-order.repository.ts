// ============================================================================
// Drizzle Waiter Orders Repository — Order operations scoped to waiter
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, orders, orderItems } from '@tavonza/database';

@Injectable()
export class DrizzleWaiterOrderRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findPendingOrdersForTables(tableIds: string[]): Promise<any[]> {
    if (tableIds.length === 0) return [];
    return this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          eq(orders.status, 'PENDING'),
        ),
      )
      .orderBy(orders.createdAt);
  }

  async findActiveOrdersForTables(tableIds: string[]): Promise<any[]> {
    if (tableIds.length === 0) return [];
    return this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          inArray(orders.status, ['CONFIRMED', 'PREPARING', 'READY']),
        ),
      )
      .orderBy(orders.acceptedAt);
  }

  async findOrderById(orderId: string): Promise<any | null> {
    const [row] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    return row ?? null;
  }

  async findOrderItemsByOrderId(orderId: string): Promise<any[]> {
    return this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async acceptOrder(orderId: string, staffId?: string): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'CONFIRMED',
        acceptedById: staffId ?? null,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  async rejectOrder(
    orderId: string,
    reason: string,
    reasonCode?: string,
    staffId?: string,
  ): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'REJECTED',
        rejectionReason: reason,
        rejectionReasonCode: (reasonCode as any) ?? 'OTHER',
        rejectedById: staffId ?? null,
        rejectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  async markServed(orderId: string): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'SERVED',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  async createOrderOnBehalfOfCustomer(data: {
    orderNumber: string;
    branchId: string;
    tableId: string;
    tableSessionId: string;
    waiterId: string;
    subtotal: string | number;
    serviceChargeRate?: string | number;
    serviceCharge?: string | number;
    taxRate?: string | number;
    tax?: string | number;
    total: string | number;
  }): Promise<any> {
    const subtotal = Number(data.subtotal);
    const serviceCharge = Number(data.serviceCharge ?? 0);
    const tax = Number(data.tax ?? 0);
    const totalAmount = Number(data.total);

    const [result] = await this.db
      .insert(orders)
      .values({
        orderNumber: data.orderNumber,
        branchId: data.branchId,
        tableId: data.tableId,
        tableSessionId: data.tableSessionId,
        status: 'CONFIRMED',
        subtotal,
        serviceCharge,
        taxAmount: tax,
        totalAmount,
        placedByStaffId: data.waiterId,
        acceptedById: data.waiterId,
        acceptedAt: new Date(),
      })
      .returning();

    return result;
  }

  async insertOrderItems(items: Array<{
    orderId: string;
    menuItemId: string;
    name: string;
    unitPrice: string | number;
    quantity: number;
    stationType?: 'KITCHEN' | 'BAR';
  }>): Promise<any[]> {
    if (items.length === 0) return [];
    return this.db
      .insert(orderItems)
      .values(
        items.map((item) => ({
          orderId: item.orderId,
          productId: item.menuItemId,
          productNameSnapshot: item.name,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          subtotal: Number(item.unitPrice) * item.quantity,
          stationType: (item.stationType ?? 'KITCHEN') as 'KITCHEN' | 'BAR',
          status: 'PENDING' as const,
        })),
      )
      .returning();
  }
}
