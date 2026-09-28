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
  OrderSubmittedEvent,
  OrderStatusChangedEvent,
} from '../../domain/events/order.events';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
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
   * Figma: "Place Order" button
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

    // Domain event — in production, emit via EventEmitter/outbox
    const _event = new OrderSubmittedEvent(
      updatedOrder.id,
      updatedOrder.orderNumber,
      updatedOrder.branchId,
      updatedOrder.tableId,
      updatedOrder.items.length,
      updatedOrder.total,
    );
    console.log('[Event] OrderSubmitted:', _event);

    return updatedOrder;
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
    filters?: { status?: OrderStatus; tableId?: string },
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

    // Domain event
    const _event = new OrderStatusChangedEvent(
      updatedOrder.id,
      updatedOrder.orderNumber,
      updatedOrder.branchId,
      updatedOrder.tableId,
      order.status,
      newStatus,
    );
    console.log('[Event] OrderStatusChanged:', _event);

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
