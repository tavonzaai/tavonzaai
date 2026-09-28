// ============================================================================
// Order Infrastructure — Drizzle Order Repository
// ============================================================================
// Implements order persistence using Drizzle ORM.
//
// KEY PATTERNS:
//   1. Insert + select:  db.insert(orders).values(...).returning()
//   2. Transactions:     db.transaction(async (tx) => { ... })
//   3. Aggregation:      Manual total recalculation after item changes
//   4. Timestamps:       Recorded per status transition
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  orders,
  orderItems,
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
        customerSessionId: input.customerSessionId ?? null,
        status: 'DRAFT',
      })
      .returning();

    return this.toDomain({ ...record!, items: [] });
  }

  // ── Find ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { items: true },
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async findDraftByTable(
    branchId: string,
    tableId: string,
  ): Promise<Order | null> {
    const result = await this.db.query.orders.findFirst({
      where: and(
        eq(orders.branchId, branchId),
        eq(orders.tableId, tableId),
        eq(orders.status, 'DRAFT'),
      ),
      with: { items: true },
    });

    if (!result) return null;
    return this.toDomain(result);
  }

  async findByBranch(
    branchId: string,
    filters?: { status?: OrderStatus; tableId?: string },
  ): Promise<Order[]> {
    const conditions = [eq(orders.branchId, branchId)];

    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters?.tableId) {
      conditions.push(eq(orders.tableId, filters.tableId));
    }

    const results = await this.db.query.orders.findMany({
      where: and(...conditions),
      with: { items: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return results.map((r) => this.toDomain(r));
  }

  // ── Item Operations ─────────────────────────────────────────────────

  async addItem(input: AddOrderItemInput): Promise<Order> {
    const addOns = input.addOns ?? [];
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const lineTotal = (input.unitPrice + addOnsTotal) * input.quantity;

    await this.db.insert(orderItems).values({
      orderId: input.orderId,
      menuItemId: input.menuItemId,
      name: input.name,
      unitPrice: String(input.unitPrice),
      quantity: input.quantity,
      specialInstructions: input.specialInstructions ?? null,
      addOns: addOns.length > 0 ? addOns : null,
      addOnsTotal: String(addOnsTotal),
      lineTotal: String(lineTotal),
    });

    return this.recalculateTotals(input.orderId);
  }

  async updateItem(
    itemId: string,
    input: UpdateOrderItemInput,
  ): Promise<Order> {
    // Fetch current item to compute new line total
    const [currentItem] = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.id, itemId));

    if (!currentItem) {
      throw new Error(`Order item ${itemId} not found`);
    }

    const newQuantity = input.quantity ?? currentItem.quantity;
    const lineTotal =
      (Number(currentItem.unitPrice) + Number(currentItem.addOnsTotal)) *
      newQuantity;

    await this.db
      .update(orderItems)
      .set({
        quantity: newQuantity,
        specialInstructions:
          input.specialInstructions ?? currentItem.specialInstructions,
        lineTotal: String(lineTotal),
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
    // Build timestamp updates based on the target status
    const timestamps: Record<string, Date> = {};
    const now = new Date();

    if (newStatus === 'SUBMITTED') timestamps.submittedAt = now;
    if (newStatus === 'ACCEPTED') timestamps.acceptedAt = now;
    if (newStatus === 'READY') timestamps.readyAt = now;
    if (newStatus === 'SERVED') timestamps.servedAt = now;

    await this.db
      .update(orders)
      .set({
        status: newStatus,
        updatedAt: now,
        ...timestamps,
      })
      .where(eq(orders.id, orderId));

    const result = await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });

    return this.toDomain(result!);
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  /**
   * Recalculate order totals from line items.
   *
   * Figma "Order Summary":
   *   Subtotal             $28.30
   *   Service Charge (5%)  $0.93
   *   Tax (8%)             $1.48
   */
  private async recalculateTotals(orderId: string): Promise<Order> {
    // Sum all line totals
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);

    // Fetch order for rates
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    const serviceChargeRate = Number(order!.serviceChargeRate);
    const taxRate = Number(order!.taxRate);
    const serviceCharge = Math.round(subtotal * serviceChargeRate * 100) / 100;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + serviceCharge + tax) * 100) / 100;

    await this.db
      .update(orders)
      .set({
        subtotal: String(subtotal),
        serviceCharge: String(serviceCharge),
        tax: String(tax),
        total: String(total),
        estimatedPrepTime: items.length > 0 ? 18 : null, // placeholder
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Refetch with items for the domain entity
    const result = await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true },
    });

    return this.toDomain(result!);
  }

  /** Generate order number like "#10001". */
  private async generateOrderNumber(branchId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.branchId, branchId));

    const number = 10000 + (result?.count ?? 0) + 1;
    return `#${number}`;
  }

  // ── Mapper (DB → Domain) ────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(record: any): Order {
    const items: OrderItemProps[] = (record.items ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        addOns: (item.addOns as OrderItemAddOn[]) ?? [],
        addOnsTotal: Number(item.addOnsTotal),
        lineTotal: Number(item.lineTotal),
      }),
    );

    const props: OrderProps = {
      id: record.id,
      orderNumber: record.orderNumber,
      branchId: record.branchId,
      tableId: record.tableId,
      tableSessionId: record.tableSessionId,
      customerSessionId: record.customerSessionId,
      status: record.status as OrderStatus,
      subtotal: Number(record.subtotal),
      serviceChargeRate: Number(record.serviceChargeRate),
      serviceCharge: Number(record.serviceCharge),
      taxRate: Number(record.taxRate),
      tax: Number(record.tax),
      total: Number(record.total),
      estimatedPrepTime: record.estimatedPrepTime,
      items,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      submittedAt: record.submittedAt,
      acceptedAt: record.acceptedAt,
      readyAt: record.readyAt,
      servedAt: record.servedAt,
    };

    return new Order(props);
  }
}
