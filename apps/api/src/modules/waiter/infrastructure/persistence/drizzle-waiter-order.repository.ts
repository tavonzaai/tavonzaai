// ============================================================================
// Drizzle Waiter Orders Repository — Order operations scoped to waiter
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import { orders, orderItems } from '@tavonza/database';

type DrizzleDb = any;

@Injectable()
export class DrizzleWaiterOrderRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findPendingOrdersForTables(tableIds: string[]): Promise<any[]> {
    if (tableIds.length === 0) return [];
    return this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          eq(orders.status, 'SUBMITTED'),
        ),
      )
      .orderBy(orders.submittedAt);
  }

  async findActiveOrdersForTables(tableIds: string[]): Promise<any[]> {
    if (tableIds.length === 0) return [];
    return this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          inArray(orders.status, ['ACCEPTED', 'KITCHEN_QUEUE', 'PREPARING', 'READY']),
        ),
      )
      .orderBy(orders.acceptedAt);
  }

  async findOrderById(orderId: string): Promise<any | null> {
    const result = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    return result[0] ?? null;
  }

  async findOrderItemsByOrderId(orderId: string): Promise<any[]> {
    return this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async acceptOrder(orderId: string): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  async rejectOrder(orderId: string, reason: string): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  }

  async markServed(orderId: string): Promise<void> {
    await this.db
      .update(orders)
      .set({
        status: 'SERVED',
        servedAt: new Date(),
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
    subtotal: string;
    serviceChargeRate: string;
    serviceCharge: string;
    taxRate: string;
    tax: string;
    total: string;
    customerAutoCreated: boolean;
  }): Promise<any> {
    const result = await this.db
      .insert(orders)
      .values({
        orderNumber: data.orderNumber,
        branchId: data.branchId,
        tableId: data.tableId,
        tableSessionId: data.tableSessionId,
        status: 'SUBMITTED', // Waiter-placed orders go straight to SUBMITTED
        subtotal: data.subtotal,
        serviceChargeRate: data.serviceChargeRate,
        serviceCharge: data.serviceCharge,
        taxRate: data.taxRate,
        tax: data.tax,
        total: data.total,
        placedByWaiterId: data.waiterId,
        customerAutoCreated: data.customerAutoCreated,
        submittedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async insertOrderItems(items: Array<{
    orderId: string;
    menuItemId: string;
    name: string;
    unitPrice: string;
    quantity: number;
    specialInstructions?: string;
    addOns?: Array<{ name: string; price: number }>;
    addOnsTotal: string;
    lineTotal: string;
  }>): Promise<any[]> {
    if (items.length === 0) return [];
    const result = await this.db
      .insert(orderItems)
      .values(items.map((item) => ({
        orderId: item.orderId,
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions ?? null,
        addOns: item.addOns ?? null,
        addOnsTotal: item.addOnsTotal,
        lineTotal: item.lineTotal,
      })))
      .returning();
    return result;
  }
}
