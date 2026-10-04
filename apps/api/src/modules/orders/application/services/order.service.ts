// ============================================================================
// Order Application — OrderService
// ============================================================================
// Orchestrates order use cases from both customer and waiter flows.
//
// CUSTOMER FLOW:
//   - getOrCreateCart()     → Get/create the customer's DRAFT order
//   - addToCart()           → Add item to cart (from item detail screen)
//   - updateCartItem()      → Change quantity in cart
//   - removeCartItem()      → Remove item from cart
//   - submitOrder()         → Place order (DRAFT → SUBMITTED)
//   - getOrderStatus()      → Track order status (timeline screen)
//
// WAITER FLOW:
//   - getOrdersByBranch()   → Orders list / table detail screen
//   - updateOrderStatus()   → Accept, mark as preparing, ready, served
//
// Business rules (status transitions) are enforced by the Order entity.
// ============================================================================

import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ORDER_REPOSITORY,
  type IOrderRepository,
  type AddOrderItemInput,
} from '../../domain/interfaces/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import type { OrderStatus } from '../../domain/enums/order-status.enum';
import {
  DRIZZLE,
  type DrizzleDatabase,
  branchSettings,
  tables,
  orders,
  OutboxService,
} from '@tavonza/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDatabase,
    private readonly outboxService: OutboxService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER USE CASES
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get or create the customer's cart (DRAFT order) for a table.
   * Only one active DRAFT order per table at a time.
   */
  async getOrCreateCart(branchId: string, tableId: string): Promise<Order> {
    const existing = await this.orderRepository.findDraftByTable(
      branchId,
      tableId,
    );
    if (existing) return existing;
    return this.orderRepository.create({ branchId, tableId });
  }

  /**
   * Add a menu item to the cart.
   * Figma: "Add To Cart" button on item detail screen
   */
  async addToCart(input: AddOrderItemInput): Promise<Order> {
    const order = await this.findOrderOrFail(input.orderId);
    if (!order.isEditable) {
      throw new BadRequestException(
        'Cannot add items to an order that has already been submitted',
      );
    }
    return this.orderRepository.addItem(input);
  }

  /**
   * Update a cart item's quantity or special instructions.
   * Figma: Quantity +/- buttons on Order Summary screen
   */
  async updateCartItem(
    orderId: string,
    itemId: string,
    input: { quantity?: number; specialInstructions?: string },
  ): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);
    if (!order.isEditable) {
      throw new BadRequestException(
        'Cannot modify items on a submitted order',
      );
    }
    return this.orderRepository.updateItem(itemId, input);
  }

  /**
   * Remove an item from the cart.
   * Figma: Swipe-to-delete on Order Summary screen
   */
  async removeCartItem(orderId: string, itemId: string): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);
    if (!order.isEditable) {
      throw new BadRequestException(
        'Cannot remove items from a submitted order',
      );
    }
    return this.orderRepository.removeItem(itemId);
  }

  /**
   * Submit the cart as a real order (DRAFT → SUBMITTED).
   * Checks branchSettings.orderAcceptanceMode:
   * - If AUTO_ACCEPT: immediately transitions to ACCEPTED (CONFIRMED), updates table to PREPARING, emits OrderAccepted.
   * - Else: sets table to ORDERING, emits OrderSubmitted.
   */
  async submitOrder(orderId: string): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);

    if (!order.canTransitionTo('SUBMITTED')) {
      throw new BadRequestException(
        `Cannot submit order in ${order.status} status`,
      );
    }

    if (order.items.length === 0) {
      throw new BadRequestException('Cannot submit an empty order');
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      'SUBMITTED',
    );

    // Check branch order acceptance mode
    const [settings] = await this.db
      .select({
        orderAcceptanceMode: branchSettings.orderAcceptanceMode,
      })
      .from(branchSettings)
      .where(eq(branchSettings.branchId, updatedOrder.branchId))
      .limit(1);

    const isAutoAccept = settings?.orderAcceptanceMode === 'AUTO_ACCEPT';

    let finalOrder = updatedOrder;

    if (isAutoAccept) {
      finalOrder = await this.orderRepository.updateStatus(orderId, 'ACCEPTED');

      await this.db
        .update(orders)
        .set({
          acceptanceMode: 'AUTO_ACCEPT',
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Advance table service status to PREPARING
      if (finalOrder.tableId) {
        await this.db
          .update(tables)
          .set({ serviceStatus: 'PREPARING', updatedAt: new Date() })
          .where(eq(tables.id, finalOrder.tableId));

        await this.outboxService.publishEvent({
          aggregateType: 'TABLE',
          aggregateId: finalOrder.tableId,
          eventType: 'TableStatusChanged',
          branchId: finalOrder.branchId,
          payload: {
            tableId: finalOrder.tableId,
            tableLabel: 'Table',
            branchId: finalOrder.branchId,
            serviceStatus: 'PREPARING',
            operationalFlag: 'NORMAL',
            activeSessionId: finalOrder.tableSessionId,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      await this.outboxService.publishEvent({
        aggregateType: 'ORDER',
        aggregateId: finalOrder.id,
        eventType: 'OrderAccepted',
        branchId: finalOrder.branchId,
        payload: {
          orderId: finalOrder.id,
          orderNumber: finalOrder.orderNumber,
          branchId: finalOrder.branchId,
          tableId: finalOrder.tableId,
          tableSessionId: finalOrder.tableSessionId,
          acceptedById: 'SYSTEM_AUTO_ACCEPT',
          acceptedAt: new Date().toISOString(),
        },
      });
    } else {
      // Advance table service status to ORDERING
      if (finalOrder.tableId) {
        await this.db
          .update(tables)
          .set({ serviceStatus: 'ORDERING', updatedAt: new Date() })
          .where(eq(tables.id, finalOrder.tableId));

        await this.outboxService.publishEvent({
          aggregateType: 'TABLE',
          aggregateId: finalOrder.tableId,
          eventType: 'TableStatusChanged',
          branchId: finalOrder.branchId,
          payload: {
            tableId: finalOrder.tableId,
            tableLabel: 'Table',
            branchId: finalOrder.branchId,
            serviceStatus: 'ORDERING',
            operationalFlag: 'NORMAL',
            activeSessionId: finalOrder.tableSessionId,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      await this.outboxService.publishEvent({
        aggregateType: 'ORDER',
        aggregateId: updatedOrder.id,
        eventType: 'OrderSubmitted',
        branchId: updatedOrder.branchId,
        payload: {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          branchId: updatedOrder.branchId,
          tableId: updatedOrder.tableId,
          tableSessionId: updatedOrder.tableSessionId,
          itemsCount: updatedOrder.items.length,
          totalAmount: updatedOrder.total,
          items: updatedOrder.items.map((i) => ({
            id: i.id,
            productName: (i as any).productName ?? i.name,
            quantity: i.quantity,
            stationType: (i as any).stationType ?? 'KITCHEN',
          })),
          occurredAt: new Date().toISOString(),
        },
      });
    }

    return finalOrder;
  }

  /**
   * Get order status with tracking timeline.
   * Figma: "Track Your Order" screen
   */
  async getOrderStatus(orderId: string): Promise<Order> {
    return this.findOrderOrFail(orderId);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WAITER USE CASES
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get all orders for a branch, with optional filters.
   * Figma (Waiter): Home dashboard + Orders tab
   */
  async getOrdersByBranch(
    branchId: string,
    filters?: { status?: OrderStatus; tableId?: string; search?: string },
  ): Promise<Order[]> {
    return this.orderRepository.findByBranch(branchId, filters);
  }

  /**
   * Update order status (waiter/kitchen action).
   * Figma (Waiter): "Mark as Served", accept, etc.
   *
   * The domain state machine validates transitions.
   * Invalid ones (e.g. DRAFT → SERVED) are rejected with a helpful error.
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);

    if (!order.canTransitionTo(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${newStatus}".`,
      );
    }

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      newStatus,
    );

    if (newStatus === 'ACCEPTED' && updatedOrder.tableId) {
      await this.db
        .update(tables)
        .set({ serviceStatus: 'PREPARING', updatedAt: new Date() })
        .where(eq(tables.id, updatedOrder.tableId));

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: updatedOrder.tableId,
        eventType: 'TableStatusChanged',
        branchId: updatedOrder.branchId,
        payload: {
          tableId: updatedOrder.tableId,
          tableLabel: 'Table',
          branchId: updatedOrder.branchId,
          serviceStatus: 'PREPARING',
          operationalFlag: 'NORMAL',
          activeSessionId: updatedOrder.tableSessionId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    if (newStatus === 'SERVED' && updatedOrder.tableId) {
      await this.db
        .update(tables)
        .set({ serviceStatus: 'SERVING', updatedAt: new Date() })
        .where(eq(tables.id, updatedOrder.tableId));

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: updatedOrder.tableId,
        eventType: 'TableStatusChanged',
        branchId: updatedOrder.branchId,
        payload: {
          tableId: updatedOrder.tableId,
          tableLabel: 'Table',
          branchId: updatedOrder.branchId,
          serviceStatus: 'SERVING',
          operationalFlag: 'NORMAL',
          activeSessionId: updatedOrder.tableSessionId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    let eventType = 'OrderStatusChanged';
    if (newStatus === 'ACCEPTED') eventType = 'OrderAccepted';
    if (newStatus === 'REJECTED') eventType = 'OrderRejected';
    if (newStatus === 'SERVED') eventType = 'OrderServed';

    await this.outboxService.publishEvent({
      aggregateType: 'ORDER',
      aggregateId: updatedOrder.id,
      eventType,
      branchId: updatedOrder.branchId,
      payload: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        branchId: updatedOrder.branchId,
        tableId: updatedOrder.tableId,
        tableSessionId: updatedOrder.tableSessionId,
        previousStatus: order.status,
        newStatus,
        occurredAt: new Date().toISOString(),
      },
    });

    return updatedOrder;
  }

  // ── Private ─────────────────────────────────────────────────────────

  private async findOrderOrFail(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }
}
