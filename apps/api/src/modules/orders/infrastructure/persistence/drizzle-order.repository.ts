// ============================================================================
// Order Infrastructure — Drizzle Order Repository
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, or, ilike, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  orders,
  orderItems,
  menuItems,
} from '@tavonza/database';
import {
  IOrderRepository,
  type CreateOrderInput,
  type AddOrderItemInput,
  type UpdateOrderItemInput,
} from '../../domain/interfaces/order-repository.interface';
import {
  Order,
  type OrderProps,
  type OrderItemProps,
  type OrderItemAddOn,
} from '../../domain/entities/order.entity';
import type { OrderStatus } from '../../domain/enums/order-status.enum';

@Injectable()
export class DrizzleOrderRepository implements IOrderRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Create ──────────────────────────────────────────────────────────

  async create(input: CreateOrderInput): Promise<Order> {
    const orderNumber = await this.generateOrderNumber(input.branchId);

    const [record] = await this.db
      .insert(orders)
      .values({
        orderNumber,
        branchId: input.branchId,
        tableId: input.tableId,
        tableSessionId: input.tableSessionId ?? null,
        status: 'DRAFT',
        subtotal: 0,
        totalAmount: 0,
      })
      .returning();

    return this.toDomain({ ...record!, items: [] });
  }

  // ── Find ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Order | null> {
    const [record] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!record) return null;

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return this.toDomain({ ...record, items });
  }

  async findDraftByTable(
    branchId: string,
    tableId: string,
  ): Promise<Order | null> {
    const [record] = await this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.branchId, branchId),
          eq(orders.tableId, tableId),
          eq(orders.status, 'DRAFT'),
        ),
      )
      .limit(1);

    if (!record) return null;

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, record.id));

    return this.toDomain({ ...record, items });
  }

  async findByBranch(
    branchId: string,
    filters?: { status?: OrderStatus; tableId?: string; search?: string },
  ): Promise<Order[]> {
    const conditions = [eq(orders.branchId, branchId)];

    if (filters?.status) {
      conditions.push(eq(orders.status, this.toDbStatus(filters.status)));
    }
    if (filters?.tableId) {
      conditions.push(eq(orders.tableId, filters.tableId));
    }
    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(or(ilike(orders.orderNumber, term), ilike(orders.guestName, term))!);
    }

    const orderRecords = await this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));

    const result: Order[] = [];
    for (const record of orderRecords) {
      const items = await this.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, record.id));
      result.push(this.toDomain({ ...record, items }));
    }

    return result;
  }

  // ── Item Operations ─────────────────────────────────────────────────

  async addItem(input: AddOrderItemInput): Promise<Order> {
    let name = input.name;
    let unitPrice = input.unitPrice;
    if (!name || unitPrice <= 0) {
      const [menuItem] = await this.db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, input.menuItemId));
      if (menuItem) {
        name = menuItem.name;
        unitPrice = Number(menuItem.basePrice);
      }
    }

    const addOns = input.addOns ?? [];
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const lineTotal = (unitPrice + addOnsTotal) * input.quantity;

    await this.db.insert(orderItems).values({
      orderId: input.orderId,
      productId: input.menuItemId,
      productNameSnapshot: name || 'Dish',
      unitPrice: unitPrice,
      quantity: input.quantity,
      subtotal: lineTotal,
      stationType: 'KITCHEN',
      status: 'PENDING',
    });

    return this.recalculateTotals(input.orderId);
  }

  async updateItem(
    itemId: string,
    input: UpdateOrderItemInput,
  ): Promise<Order> {
    const [currentItem] = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.id, itemId));

    if (!currentItem) {
      throw new Error(`Order item ${itemId} not found`);
    }

    const newQuantity = input.quantity ?? currentItem.quantity;
    const lineTotal = currentItem.unitPrice * newQuantity;

    await this.db
      .update(orderItems)
      .set({
        quantity: newQuantity,
        subtotal: lineTotal,
        updatedAt: new Date(),
      })
      .where(eq(orderItems.id, itemId));

    return this.recalculateTotals(currentItem.orderId);
  }

  async removeItem(itemId: string): Promise<Order> {
    const [currentItem] = await this.db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.id, itemId));

    if (!currentItem) {
      throw new Error(`Order item ${itemId} not found`);
    }

    await this.db.delete(orderItems).where(eq(orderItems.id, itemId));

    return this.recalculateTotals(currentItem.orderId);
  }

  // ── Status Transitions ──────────────────────────────────────────────

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<Order> {
    const now = new Date();
    const dbStatus = this.toDbStatus(newStatus);

    await this.db
      .update(orders)
      .set({
        status: dbStatus,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId));

    const [record] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return this.toDomain({ ...record!, items });
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  private async recalculateTotals(orderId: string): Promise<Order> {
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + serviceCharge + tax) * 100) / 100;

    await this.db
      .update(orders)
      .set({
        subtotal,
        serviceCharge,
        taxAmount: tax,
        totalAmount: total,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    const [result] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    return this.toDomain({ ...result!, items });
  }

  private async generateOrderNumber(_branchId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders);

    const seq = (result?.count ?? 0) + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `#${10000 + seq}-${randomSuffix}`;
  }

  private toDbStatus(status: OrderStatus): any {
    switch (status) {
      case 'DRAFT':
        return 'DRAFT';
      case 'SUBMITTED':
        return 'PENDING';
      case 'ACCEPTED':
      case 'KITCHEN_QUEUE':
        return 'CONFIRMED';
      case 'PREPARING':
        return 'PREPARING';
      case 'READY':
        return 'READY';
      case 'SERVED':
        return 'SERVED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'REJECTED':
        return 'REJECTED';
      default:
        return 'PENDING';
    }
  }

  private fromDbStatus(status: string | null): OrderStatus {
    switch (status) {
      case 'DRAFT':
        return 'DRAFT';
      case 'PENDING':
        return 'SUBMITTED';
      case 'CONFIRMED':
        return 'ACCEPTED';
      case 'PREPARING':
        return 'PREPARING';
      case 'READY':
        return 'READY';
      case 'SERVED':
      case 'COMPLETED':
        return 'SERVED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'REJECTED':
        return 'REJECTED';
      default:
        return 'SUBMITTED';
    }
  }

  // ── Mapper (DB → Domain) ────────────────────────────────────────────

  private toDomain(record: any): Order {
    const items: OrderItemProps[] = (record.items ?? []).map((item: any) => ({
      id: item.id,
      menuItemId: item.productId,
      name: item.productNameSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      specialInstructions: null,
      addOns: [] as OrderItemAddOn[],
      addOnsTotal: 0,
      lineTotal: Number(item.subtotal),
    }));

    const props: OrderProps = {
      id: record.id,
      orderNumber: record.orderNumber,
      branchId: record.branchId,
      tableId: record.tableId ?? '',
      tableSessionId: record.tableSessionId,
      customerSessionId: record.guestSessionId,
      status: this.fromDbStatus(record.status),
      subtotal: Number(record.subtotal),
      serviceChargeRate: 0.05,
      serviceCharge: Number(record.serviceCharge ?? 0),
      taxRate: 0.08,
      tax: Number(record.taxAmount ?? 0),
      total: Number(record.totalAmount ?? 0),
      estimatedPrepTime: 15,
      items,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? new Date(),
      submittedAt: record.createdAt,
      acceptedAt: record.acceptedAt,
      readyAt: null,
      servedAt: null,
    };

    return new Order(props);
  }
}
