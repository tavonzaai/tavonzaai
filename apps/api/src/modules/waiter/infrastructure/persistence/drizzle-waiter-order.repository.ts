// ============================================================================
// Drizzle Waiter Orders Repository — Order operations scoped to waiter
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, orders, orderItems, tables } from '@tavonza/database';
import { isUUID } from '@tavonza/shared';
import { DrizzleQueryBuilder } from '../../../../common/database';

@Injectable()
export class DrizzleWaiterOrderRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findOrdersForTables(
    tableIds: string[],
    branchId: string,
    filters: { scope?: string; status?: string; tableId?: string; search?: string },
  ): Promise<any[]> {
    if (!branchId || !isUUID(branchId)) {
      return [];
    }

    const isAllTables = filters.scope?.toUpperCase() === 'ALL_TABLES';
    const isMyTables = filters.scope?.toUpperCase() === 'MY_TABLES';

    const qb = new DrizzleQueryBuilder<typeof orders>(this.db, orders)
      .filterExact({ branchId })
      .sort('createdAt', 'desc');

    if (filters.tableId && filters.tableId.trim()) {
      const cleanTableId = filters.tableId.trim();
      if (isUUID(cleanTableId)) {
        qb.filterExact({ tableId: cleanTableId });
      } else {
        // Resolve table by label / tableNumber in this branch
        const [tableRecord] = await this.db
          .select({ id: tables.id })
          .from(tables)
          .where(and(eq(tables.branchId, branchId), eq(tables.label, cleanTableId)))
          .limit(1);

        if (tableRecord) {
          qb.filterExact({ tableId: tableRecord.id });
        } else {
          return [];
        }
      }
    } else if (isMyTables) {
      if (tableIds.length === 0) return [];
      qb.filterIn({ tableId: tableIds });
    } else if (!isAllTables && tableIds.length > 0) {
      qb.filterIn({ tableId: tableIds });
    }


    const scopeUpper = filters.scope?.toUpperCase();
    if (filters.status) {
      if (filters.status.includes(',')) {
        const statuses = filters.status.split(',').map((s) => s.trim().toUpperCase());
        qb.filterIn({ status: statuses });
      } else {
        qb.filterExact({ status: filters.status.trim().toUpperCase() });
      }
    } else if (scopeUpper === 'PENDING') {
      qb.filterExact({ status: 'PENDING' });
    } else if (scopeUpper === 'ACTIVE') {
      qb.filterIn({ status: ['CONFIRMED', 'PREPARING', 'READY'] });
    } else if (scopeUpper === 'SERVED' || scopeUpper === 'COMPLETED') {
      qb.filterIn({ status: ['SERVED', 'COMPLETED'] });
    } else if (scopeUpper === 'CANCELLED' || scopeUpper === 'REJECTED') {
      qb.filterIn({ status: ['CANCELLED', 'REJECTED'] });
    }

    if (filters.search && filters.search.trim()) {
      qb.search(filters.search, [orders.orderNumber, orders.guestName]);
    }

    const rows = await qb.executePlain();

    return this.attachTableAndItems(rows);
  }

  async findPendingOrdersForTables(tableIds: string[], branchId?: string): Promise<any[]> {
    if (branchId) {
      return this.findOrdersForTables(tableIds, branchId, { status: 'PENDING' });
    }
    if (tableIds.length === 0) return [];
    const rows = await this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          eq(orders.status, 'PENDING'),
        ),
      )
      .orderBy(orders.createdAt);
    return this.attachTableAndItems(rows);
  }

  async findActiveOrdersForTables(tableIds: string[], branchId?: string): Promise<any[]> {
    if (branchId) {
      return this.findOrdersForTables(tableIds, branchId, { status: 'CONFIRMED,PREPARING,READY' });
    }
    if (tableIds.length === 0) return [];
    const rows = await this.db
      .select()
      .from(orders)
      .where(
        and(
          inArray(orders.tableId, tableIds),
          inArray(orders.status, ['CONFIRMED', 'PREPARING', 'READY']),
        ),
      )
      .orderBy(orders.acceptedAt);
    return this.attachTableAndItems(rows);
  }

  private async attachTableAndItems(orderRows: any[]): Promise<any[]> {
    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map((row) => row.id);
    const tableIds = Array.from(
      new Set(orderRows.map((row) => row.tableId).filter(Boolean)),
    );

    const [itemRows, tableRows] = await Promise.all([
      this.db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds)),
      tableIds.length > 0
        ? this.db.select().from(tables).where(inArray(tables.id, tableIds))
        : Promise.resolve([]),
    ]);

    const itemsByOrder = new Map<string, any[]>();
    for (const item of itemRows) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    const tableById = new Map(tableRows.map((table) => [table.id, table]));

    return orderRows.map((row) => {
      const table = row.tableId ? tableById.get(row.tableId) : undefined;
      const items = itemsByOrder.get(row.id) ?? [];
      return {
        ...row,
        tableNumber: table?.label ?? row.tableNumber ?? null,
        tableLabel: table?.label ?? row.tableLabel ?? null,
        itemsCount: items.length,
        itemCount: items.length,
        totalAmount: Number(row.totalAmount ?? row.total ?? 0),
        total: Number(row.totalAmount ?? row.total ?? 0),
        items: items.map((item) => ({
          id: item.id,
          menuItemId: item.productId,
          productName: item.productNameSnapshot,
          name: item.productNameSnapshot,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          status: item.status,
          stationType: item.stationType,
        })),
      };
    });
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
