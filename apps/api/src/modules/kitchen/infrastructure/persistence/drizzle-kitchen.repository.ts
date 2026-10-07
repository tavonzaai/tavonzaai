import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  orders,
  orderItems,
  tables,
  menuItems,
} from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type {
  KitchenTicketItemEntity,
  KitchenStationType,
  KitchenItemStatus,
} from '../../domain/entities/kitchen-ticket.entity';

@Injectable()
export class DrizzleKitchenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async findActiveTickets(
    branchId: string,
    station?: KitchenStationType
  ): Promise<KitchenTicketItemEntity[]> {
    const qb = new DrizzleQueryBuilder<any>(this.db, orderItems)
      .select({
        id: orderItems.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        tableLabel: tables.label,
        productName: orderItems.productNameSnapshot,
        quantity: orderItems.quantity,
        stationType: orderItems.stationType,
        status: orderItems.status,
        specialInstructions: orders.specialInstructions,
        preparingAt: orderItems.preparingAt,
        readyAt: orderItems.readyAt,
        servedAt: orderItems.servedAt,
        createdAt: orderItems.createdAt,
      })
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .leftJoin(tables, eq(tables.id, orders.tableId))
      .filterExact(
        {
          branchId,
          stationType: station,
        },
        {
          branchId: orders.branchId,
          stationType: orderItems.stationType,
        },
      )
      .filterIn(
        {
          status: ['CONFIRMED', 'PREPARING', 'READY'],
        },
        {
          status: orders.status,
        },
      );

    const rows = await qb.executePlain();

    return rows.map((r: {
      id: string;
      orderId: string;
      orderNumber: string;
      tableLabel: string | null;
      productName: string;
      quantity: number;
      stationType: string;
      status: string | null;
      specialInstructions: string | null;
      preparingAt: Date | null;
      readyAt: Date | null;
      servedAt: Date | null;
      createdAt: Date | null;
    }) => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      tableLabel: r.tableLabel,
      productName: r.productName,
      quantity: r.quantity,
      stationType: r.stationType as KitchenStationType,
      status: (r.status ?? 'PENDING') as KitchenItemStatus,
      specialInstructions: r.specialInstructions,
      preparingAt: r.preparingAt,
      readyAt: r.readyAt,
      servedAt: r.servedAt,
      createdAt: r.createdAt ?? new Date(),
    }));
  }

  async updateItemStatus(
    itemId: string,
    status: KitchenItemStatus,
    unavailableReason?: string
  ): Promise<KitchenTicketItemEntity | null> {
    const now = new Date();
    const updates: Record<string, any> = {
      status,
      updatedAt: now,
    };

    if (status === 'PREPARING') updates.preparingAt = now;
    if (status === 'READY') updates.readyAt = now;
    if (status === 'SERVED') updates.servedAt = now;
    if (unavailableReason) updates.unavailableReason = unavailableReason;

    await this.db
      .update(orderItems)
      .set(updates)
      .where(eq(orderItems.id, itemId));

    const [row] = await this.db
      .select({
        id: orderItems.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        branchId: orders.branchId,
        tableId: orders.tableId,
        tableSessionId: orders.tableSessionId,
        tableLabel: tables.label,
        productName: orderItems.productNameSnapshot,
        quantity: orderItems.quantity,
        stationType: orderItems.stationType,
        status: orderItems.status,
        specialInstructions: orders.specialInstructions,
        preparingAt: orderItems.preparingAt,
        readyAt: orderItems.readyAt,
        servedAt: orderItems.servedAt,
        createdAt: orderItems.createdAt,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .leftJoin(tables, eq(tables.id, orders.tableId))
      .where(eq(orderItems.id, itemId));

    if (!row) return null;

    return {
      id: row.id,
      orderId: row.orderId,
      orderNumber: row.orderNumber,
      branchId: row.branchId,
      tableId: row.tableId,
      tableSessionId: row.tableSessionId,
      tableLabel: row.tableLabel,
      productName: row.productName,
      quantity: row.quantity,
      stationType: row.stationType as KitchenStationType,
      status: (row.status ?? 'PENDING') as KitchenItemStatus,
      specialInstructions: row.specialInstructions,
      preparingAt: row.preparingAt,
      readyAt: row.readyAt,
      servedAt: row.servedAt,
      createdAt: row.createdAt ?? new Date(),
    };
  }

  async getOrderAndSiblingItems(orderId: string): Promise<{
    order: {
      id: string;
      orderNumber: string;
      branchId: string;
      tableId: string | null;
      tableSessionId: string | null;
      status: string | null;
    } | null;
    items: Array<{
      id: string;
      status: string | null;
      stationType: string;
    }>;
  }> {
    const [order] = await this.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        branchId: orders.branchId,
        tableId: orders.tableId,
        tableSessionId: orders.tableSessionId,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return { order: null, items: [] };

    const items = await this.db
      .select({
        id: orderItems.id,
        status: orderItems.status,
        stationType: orderItems.stationType,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return { order, items };
  }

  async updateOrderStatus(orderId: string, status: any): Promise<void> {
    await this.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  async updateTableStatus(tableId: string, serviceStatus: any): Promise<void> {
    await this.db
      .update(tables)
      .set({ serviceStatus, updatedAt: new Date() })
      .where(eq(tables.id, tableId));
  }

  async toggleMenuItemAvailability(
    menuItemId: string,
    isAvailable: boolean
  ): Promise<void> {
    await this.db
      .update(menuItems)
      .set({
        isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, menuItemId));
  }
}
