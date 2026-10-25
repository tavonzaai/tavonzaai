// ============================================================================
// Order Application — OrderService
// ============================================================================
// Orchestrates order use cases from both customer and waiter flows.
//
// CUSTOMER FLOW:
//   - Cart lifecycle lives in CartService; checkout in CheckoutService.
//   - announceSubmittedOrder() → Waiter-approval / auto-accept workflow
//   - getOrderStatus()         → Track order status (timeline screen)
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
} from '../repositories/order-repository.interface';
import { Order } from '../domain/order.entity';
import type { OrderStatus } from '../domain/order-status.enum';
import {
  DRIZZLE,
  type DrizzleDatabase,
  branchSettings,
  tables,
  orders,
  orderItems,
  menuItems,
  OutboxService,
} from '@/database';
import { and, eq, or, sql } from 'drizzle-orm';

import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { NotificationService } from '../../notifications/services/notification.service';
import { BranchAccessService } from '../../authorization/services/branch-access.service';
import type { CustomerPrincipal } from '../../identity/services/customer-principal.service';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { isOrderOwnedBy } from '../domain/order-access';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDatabase,
    private readonly outboxService: OutboxService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER USE CASES
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Runs the post-submission workflow for a freshly persisted SUBMITTED order.
   * Checks branchSettings.orderAcceptanceMode:
   * - If AUTO_ACCEPT: immediately transitions to ACCEPTED (CONFIRMED), updates table to PREPARING, emits OrderAccepted.
   * - Else: sets table to ORDERING, notifies waiters for approval, emits OrderSubmitted.
   */
  async announceSubmittedOrder(updatedOrder: Order): Promise<Order> {
    const orderId = updatedOrder.id;

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
            tableLabel: finalOrder.tableLabel ?? 'Table',
            branchId: finalOrder.branchId,
            serviceStatus: 'PREPARING',
            operationalFlag: 'NORMAL',
            activeSessionId: finalOrder.tableSessionId,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      this.realtimeGateway.emitOrderStatusChanged({
        eventType: 'ORDER_STATUS_CHANGED',
        eventId: finalOrder.id,
        branchId: finalOrder.branchId,
        orderId: finalOrder.id,
        orderNumber: finalOrder.orderNumber,
        tableId: finalOrder.tableId,
        tableSessionId: finalOrder.tableSessionId,
        status: 'CONFIRMED',
        occurredAt: new Date().toISOString(),
      });

      if (finalOrder.tableId) {
        this.realtimeGateway.emitTableStatusChanged({
          eventType: 'TABLE_STATUS_CHANGED',
          eventId: finalOrder.tableId,
          branchId: finalOrder.branchId,
          tableId: finalOrder.tableId,
          tableLabel: finalOrder.tableLabel ?? 'Table',
          serviceStatus: 'PREPARING',
          operationalFlag: 'NORMAL',
          activeSessionId: finalOrder.tableSessionId,
          occurredAt: new Date().toISOString(),
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

        this.realtimeGateway.emitTableStatusChanged({
          eventType: 'TABLE_STATUS_CHANGED',
          eventId: finalOrder.tableId,
          branchId: finalOrder.branchId,
          tableId: finalOrder.tableId,
          tableLabel: finalOrder.tableLabel ?? 'Table',
          serviceStatus: 'ORDERING',
          operationalFlag: 'NORMAL',
          activeSessionId: finalOrder.tableSessionId,
          occurredAt: new Date().toISOString(),
        });

        await this.outboxService.publishEvent({
          aggregateType: 'TABLE',
          aggregateId: finalOrder.tableId,
          eventType: 'TableStatusChanged',
          branchId: finalOrder.branchId,
          payload: {
            tableId: finalOrder.tableId,
            tableLabel: finalOrder.tableLabel ?? 'Table',
            branchId: finalOrder.branchId,
            serviceStatus: 'ORDERING',
            operationalFlag: 'NORMAL',
            activeSessionId: finalOrder.tableSessionId,
            updatedAt: new Date().toISOString(),
          },
        });
      }

      this.realtimeGateway.emitOrderCreated({
        eventType: 'ORDER_CREATED',
        eventId: updatedOrder.id,
        branchId: updatedOrder.branchId,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        tableId: updatedOrder.tableId,
        tableSessionId: updatedOrder.tableSessionId,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        totalAmount: updatedOrder.total,
        acceptanceMode: 'WAITER_APPROVAL',
        itemsCount: updatedOrder.items.length,
        occurredAt: new Date().toISOString(),
      });

      // Notify waitstaff about pending order
      await this.notificationService.create({
        branchId: updatedOrder.branchId,
        targetRole: 'WAITER',
        type: 'ORDER_PENDING_APPROVAL',
        title: `New Order ${updatedOrder.orderNumber}`,
        message: `Order ${updatedOrder.orderNumber} placed and awaiting approval.`,
        entityType: 'ORDER',
        entityId: updatedOrder.id,
      });

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

  /** Reads an order on behalf of a diner; orders they did not place are reported as missing. */
  async getOrderForCustomer(principal: CustomerPrincipal, orderId: string): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);
    if (!isOrderOwnedBy(order, principal)) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async getOrdersForCustomer(
    principal: CustomerPrincipal,
    filters?: { status?: OrderStatus; search?: string; branchId?: string },
  ): Promise<Order[]> {
    return this.orderRepository.findByOwner(
      { customerId: principal.customerId, guestSessionId: principal.guestSessionId },
      filters,
    );
  }

  /** Reads an order for staff after checking the order's branch is within their tenant scope. */
  async getOrderForStaff(user: JwtPayload, orderId: string): Promise<Order> {
    const order = await this.findOrderOrFail(orderId);
    await this.branchAccess.assertAccess(user, order.branchId);
    return order;
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
    filters?: {
      status?: OrderStatus;
      tableId?: string;
      search?: string;
      guestSessionId?: string;
      tableSessionId?: string;
    },
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

    // Persist cooking timestamps according to status
    const now = new Date();
    if (newStatus === 'PREPARING') {
      await this.db
        .update(orders)
        .set({
          prepStartedAt: sql`COALESCE(${orders.prepStartedAt}, ${now})`,
          updatedAt: now,
        })
        .where(eq(orders.id, orderId));

      await this.db
        .update(orderItems)
        .set({
          preparingAt: sql`COALESCE(${orderItems.preparingAt}, ${now})`,
          status: 'PREPARING',
          updatedAt: now,
        })
        .where(and(eq(orderItems.orderId, orderId), eq(orderItems.status, 'PENDING')));
    } else if (newStatus === 'READY') {
      await this.db
        .update(orders)
        .set({
          readyAt: sql`COALESCE(${orders.readyAt}, ${now})`,
          updatedAt: now,
        })
        .where(eq(orders.id, orderId));

      await this.db
        .update(orderItems)
        .set({
          readyAt: sql`COALESCE(${orderItems.readyAt}, ${now})`,
          status: 'READY',
          updatedAt: now,
        })
        .where(and(eq(orderItems.orderId, orderId), or(eq(orderItems.status, 'PENDING'), eq(orderItems.status, 'PREPARING'))));
    } else if (newStatus === 'SERVED') {
      await this.db
        .update(orders)
        .set({
          servedAt: sql`COALESCE(${orders.servedAt}, ${now})`,
          updatedAt: now,
        })
        .where(eq(orders.id, orderId));

      await this.db
        .update(orderItems)
        .set({
          servedAt: sql`COALESCE(${orderItems.servedAt}, ${now})`,
          status: 'SERVED',
          updatedAt: now,
        })
        .where(eq(orderItems.orderId, orderId));
    } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
      // Idempotently restore inventory if previously deducted and not yet restored
      if (order.inventoryDeducted && !order.inventoryRestored) {
        await this.db.transaction(async (tx) => {
          for (const item of order.items) {
            const [menuItem] = await tx
              .select({ isStockTracked: menuItems.isStockTracked })
              .from(menuItems)
              .where(eq(menuItems.id, item.menuItemId));

            if (menuItem?.isStockTracked) {
              await tx
                .update(menuItems)
                .set({
                  stockQuantity: sql`${menuItems.stockQuantity} + ${item.quantity}`,
                  updatedAt: now,
                })
                .where(eq(menuItems.id, item.menuItemId));
            }
          }

          await tx
            .update(orders)
            .set({
              inventoryRestored: true,
              updatedAt: now,
            })
            .where(eq(orders.id, orderId));
        });
      }
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

      this.realtimeGateway.emitTableStatusChanged({
        eventType: 'TABLE_STATUS_CHANGED',
        eventId: updatedOrder.tableId,
        branchId: updatedOrder.branchId,
        tableId: updatedOrder.tableId,
        tableLabel: updatedOrder.tableLabel ?? 'Table',
        serviceStatus: 'PREPARING',
        operationalFlag: 'NORMAL',
        activeSessionId: updatedOrder.tableSessionId,
        occurredAt: new Date().toISOString(),
      });

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: updatedOrder.tableId,
        eventType: 'TableStatusChanged',
        branchId: updatedOrder.branchId,
        payload: {
          tableId: updatedOrder.tableId,
          tableLabel: updatedOrder.tableLabel ?? 'Table',
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

      this.realtimeGateway.emitTableStatusChanged({
        eventType: 'TABLE_STATUS_CHANGED',
        eventId: updatedOrder.tableId,
        branchId: updatedOrder.branchId,
        tableId: updatedOrder.tableId,
        tableLabel: updatedOrder.tableLabel ?? 'Table',
        serviceStatus: 'SERVING',
        operationalFlag: 'NORMAL',
        activeSessionId: updatedOrder.tableSessionId,
        occurredAt: new Date().toISOString(),
      });

      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: updatedOrder.tableId,
        eventType: 'TableStatusChanged',
        branchId: updatedOrder.branchId,
        payload: {
          tableId: updatedOrder.tableId,
          tableLabel: updatedOrder.tableLabel ?? 'Table',
          branchId: updatedOrder.branchId,
          serviceStatus: 'SERVING',
          operationalFlag: 'NORMAL',
          activeSessionId: updatedOrder.tableSessionId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const dbStatusMap: Record<string, any> = {
      DRAFT: 'DRAFT',
      SUBMITTED: 'PENDING',
      ACCEPTED: 'CONFIRMED',
      KITCHEN_QUEUE: 'CONFIRMED',
      PREPARING: 'PREPARING',
      READY: 'READY',
      SERVED: 'SERVED',
      CANCELLED: 'CANCELLED',
      REJECTED: 'REJECTED',
    };
    const mappedDbStatus = dbStatusMap[newStatus] ?? 'PENDING';

    this.realtimeGateway.emitOrderStatusChanged({
      eventType: 'ORDER_STATUS_CHANGED',
      eventId: updatedOrder.id,
      branchId: updatedOrder.branchId,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      tableId: updatedOrder.tableId,
      tableSessionId: updatedOrder.tableSessionId,
      status: mappedDbStatus,
      previousStatus: order.status,
      occurredAt: new Date().toISOString(),
    });

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
