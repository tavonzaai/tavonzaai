// ============================================================================
// Order Infrastructure — Drizzle Order Repository
// ============================================================================

import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { and, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  orders,
  orderItems,
  menuItems,
  menuCategories,
  branchSettings,
  tables,
} from '@/database';
import {
  IOrderRepository,
  type CreateOrderInput,
  type AddOrderItemInput,
  type UpdateOrderItemInput,
} from './order-repository.interface';
import {
  Order,
  type OrderProps,
  type OrderItemProps,
  type OrderItemAddOn,
} from '../domain/order.entity';
import type { OrderStatus } from '../domain/order-status.enum';
import { ResourceNotFoundException } from '../../../common/errors/app.exception';

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
        guestSessionId: input.customerSessionId ?? null,
        status: 'DRAFT',
        subtotal: 0,
        totalAmount: 0,
      })
      .returning();

    let tableLabel: string | null = null;
    if (input.tableId) {
      const [t] = await this.db
        .select({ label: tables.label })
        .from(tables)
        .where(eq(tables.id, input.tableId))
        .limit(1);
      tableLabel = t?.label ?? null;
    }

    return this.toDomain({ ...record!, tableLabel, items: [] });
  }

  // ── Find ────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Order | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const [record] = await this.db
      .select({
        order: orders,
        tableLabel: tables.label,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(isUuid ? or(eq(orders.id, id), eq(orders.orderNumber, id)) : eq(orders.orderNumber, id))
      .limit(1);

    if (!record) return null;

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, record.order.id));

    return this.toDomain({ ...record.order, tableLabel: record.tableLabel, items });
  }

  async findDraftByTable(
    branchId: string,
    tableId: string,
    guestSessionId?: string,
  ): Promise<Order | null> {
    // If guestSessionId is provided, first try to find the guest's own draft
    if (guestSessionId) {
      const [guestRecord] = await this.db
        .select({
          order: orders,
          tableLabel: tables.label,
        })
        .from(orders)
        .leftJoin(tables, eq(orders.tableId, tables.id))
        .where(
          and(
            eq(orders.branchId, branchId),
            eq(orders.tableId, tableId),
            eq(orders.guestSessionId, guestSessionId),
            eq(orders.status, 'DRAFT'),
          ),
        )
        .limit(1);

      if (guestRecord) {
        const items = await this.db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, guestRecord.order.id));
        return this.toDomain({ ...guestRecord.order, tableLabel: guestRecord.tableLabel, items });
      }
    }

    const [record] = await this.db
      .select({
        order: orders,
        tableLabel: tables.label,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
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
      .where(eq(orderItems.orderId, record.order.id));

    return this.toDomain({ ...record.order, tableLabel: record.tableLabel, items });
  }

  async findByBranch(
    branchId: string,
    filters?: {
      status?: OrderStatus;
      tableId?: string;
      search?: string;
      guestSessionId?: string;
      tableSessionId?: string;
    },
  ): Promise<Order[]> {
    const conditions = [eq(orders.branchId, branchId)];

    if (filters?.status) {
      conditions.push(eq(orders.status, this.toDbStatus(filters.status)));
    }
    if (filters?.tableId) {
      conditions.push(eq(orders.tableId, filters.tableId));
    }
    if (filters?.guestSessionId) {
      conditions.push(eq(orders.guestSessionId, filters.guestSessionId));
    }
    if (filters?.tableSessionId) {
      conditions.push(eq(orders.tableSessionId, filters.tableSessionId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          sql`${orders.orderNumber} ILIKE ${'%' + filters.search + '%'}`,
          sql`${orders.guestName} ILIKE ${'%' + filters.search + '%'}`,
        )!,
      );
    }

    return this.findWhere(conditions);
  }

  async findByOwner(
    owner: { customerId?: string | null; guestSessionId?: string | null },
    filters?: { status?: OrderStatus; search?: string; branchId?: string },
  ): Promise<Order[]> {
    const ownerConditions = [
      owner.customerId ? eq(orders.customerId, owner.customerId) : undefined,
      owner.guestSessionId ? eq(orders.guestSessionId, owner.guestSessionId) : undefined,
    ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));
    if (ownerConditions.length === 0) return [];

    const conditions = [or(...ownerConditions)!, sql`${orders.status} <> 'DRAFT'`];
    if (filters?.status) {
      conditions.push(eq(orders.status, this.toDbStatus(filters.status)));
    }
    if (filters?.branchId) {
      conditions.push(eq(orders.branchId, filters.branchId));
    }
    if (filters?.search) {
      conditions.push(sql`${orders.orderNumber} ILIKE ${'%' + filters.search + '%'}`);
    }
    return this.findWhere(conditions);
  }

  async findByIdempotencyKey(key: string) {
    const [row] = await this.db
      .select({ id: orders.id, customerId: orders.customerId, guestSessionId: orders.guestSessionId })
      .from(orders)
      .where(eq(orders.idempotencyKey, key))
      .limit(1);
    return row ?? null;
  }

  private async findWhere(conditions: SQL[]): Promise<Order[]> {
    const orderRows = await this.db
      .select({
        order: orders,
        tableLabel: tables.label,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(and(...conditions))
      .orderBy(sql`${orders.createdAt} DESC`);

    if (orderRows.length === 0) return [];

    const orderIds = orderRows.map((r) => r.order.id);
    const allItems = await this.db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return orderRows.map((row) =>
      this.toDomain({
        ...row.order,
        tableLabel: row.tableLabel,
        items: itemsByOrder.get(row.order.id) ?? [],
      }),
    );
  }

  // ── Item Operations ─────────────────────────────────────────────────

  async addItem(input: AddOrderItemInput): Promise<Order> {
    const [menuItem] = await this.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, input.menuItemId));

    if (!menuItem) {
      throw new ResourceNotFoundException('MenuItem', input.menuItemId);
    }
    if (!menuItem.isAvailable) {
      throw new BadRequestException(`Item "${menuItem.name}" is currently unavailable`);
    }
    if (menuItem.isStockTracked && (menuItem.stockQuantity ?? 0) < input.quantity) {
      throw new BadRequestException(
        `Item "${menuItem.name}" is out of stock (only ${menuItem.stockQuantity ?? 0} available)`,
      );
    }

    let name = menuItem.name;
    let unitPrice = Number(menuItem.basePrice);
    let stationType: 'KITCHEN' | 'BAR' = 'KITCHEN';

    const [category] = await this.db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.id, menuItem.categoryId));
    if (category && /drink|beverage|bar|cocktail|wine|beer|water|juice/i.test(category.name)) {
      stationType = 'BAR';
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
      stationType,
      status: 'PENDING',
      estimatedPrepTime: menuItem.estimatedPrepTime ?? 15,
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
      throw new ResourceNotFoundException('OrderItem', itemId);
    }

    if (input.quantity !== undefined && input.quantity > currentItem.quantity) {
      const [menuItem] = await this.db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, currentItem.productId));
      if (menuItem?.isStockTracked && (menuItem.stockQuantity ?? 0) < input.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${menuItem.name}". Only ${menuItem.stockQuantity ?? 0} available.`,
        );
      }
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
      throw new ResourceNotFoundException('OrderItem', itemId);
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
      .select({
        order: orders,
        tableLabel: tables.label,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, orderId));

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return this.toDomain({ ...record!.order, tableLabel: record?.tableLabel, items });
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  private async recalculateTotals(orderId: string): Promise<Order> {
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const [orderRec] = await this.db
      .select({ branchId: orders.branchId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    let taxRate = 0.08;
    let serviceRate = 0.05;

    if (orderRec?.branchId) {
      const [settings] = await this.db
        .select({
          taxPercent: branchSettings.taxPercent,
          serviceChargePct: branchSettings.serviceChargePct,
        })
        .from(branchSettings)
        .where(eq(branchSettings.branchId, orderRec.branchId))
        .limit(1);

      if (settings) {
        if (typeof settings.taxPercent === 'number') {
          taxRate = settings.taxPercent / 100;
        }
        if (typeof settings.serviceChargePct === 'number') {
          serviceRate = settings.serviceChargePct / 100;
        }
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceCharge = Math.round(subtotal * serviceRate * 100) / 100;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
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
      .select({
        order: orders,
        tableLabel: tables.label,
      })
      .from(orders)
      .leftJoin(tables, eq(orders.tableId, tables.id))
      .where(eq(orders.id, orderId));

    return this.toDomain({ ...result!.order, tableLabel: result?.tableLabel, items });
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
      specialInstructions: item.specialInstructions ?? null,
      addOns: [] as OrderItemAddOn[],
      addOnsTotal: 0,
      lineTotal: Number(item.subtotal),
      estimatedPrepTime: item.estimatedPrepTime ?? 15,
    }));

    const props: OrderProps = {
      id: record.id,
      orderNumber: record.orderNumber,
      branchId: record.branchId,
      tableId: record.tableId ?? '',
      tableLabel: record.tableLabel ?? null,
      tableNumber: record.tableLabel ?? null,
      tableSessionId: record.tableSessionId,
      customerSessionId: record.guestSessionId,
      customerId: record.customerId ?? null,
      status: this.fromDbStatus(record.status),
      subtotal: Number(record.subtotal),
      serviceChargeRate: 0.05,
      serviceCharge: Number(record.serviceCharge ?? 0),
      taxRate: 0.08,
      tax: Number(record.taxAmount ?? 0),
      total: Number(record.totalAmount ?? 0),
      estimatedPrepTime: record.estimatedPrepTime ?? 15,
      items,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? new Date(),
      submittedAt: record.createdAt,
      acceptedAt: record.acceptedAt,
      prepStartedAt: record.prepStartedAt ?? null,
      readyAt: record.readyAt ?? null,
      servedAt: record.servedAt ?? null,
      inventoryDeducted: record.inventoryDeducted ?? false,
      inventoryRestored: record.inventoryRestored ?? false,
    };

    return new Order(props);
  }
}
